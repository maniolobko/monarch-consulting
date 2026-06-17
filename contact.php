<?php
/* ============================================================
   MONARCH CONSULTING — traitement du formulaire de contact
   Compatible hébergement IONOS (fonction mail() de PHP).
   Le formulaire envoie les données en POST (fetch/JSON).
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

/* --- Adresse de réception --- */
$DEST = 'Contact@monarch-consulting-io.com';

/* --- N'accepter que le POST --- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'Méthode non autorisée.']);
    exit;
}

/* --- Anti-spam : champ "honeypot" invisible. Rempli = robot --- */
if (!empty($_POST['company_url'])) {
    // On répond "ok" pour ne pas informer le robot, mais on n'envoie rien.
    echo json_encode(['ok' => true, 'msg' => 'Merci pour votre message.']);
    exit;
}

/* --- Récupération + nettoyage --- */
function clean($v) { return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', (string)$v)); }

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$phone   = clean($_POST['phone']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = trim($_POST['message']  ?? '');
$consent = isset($_POST['consent']) && $_POST['consent'] !== '' && $_POST['consent'] !== '0';

/* --- Validation serveur --- */
$errors = [];
if ($name === '')                                            $errors[] = 'le nom';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))              $errors[] = 'un email valide';
if ($message === '')                                         $errors[] = 'un message';
if (!$consent)                                               $errors[] = 'votre consentement';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'msg' => 'Merci de renseigner : ' . implode(', ', $errors) . '.']);
    exit;
}

/* --- Construction de l'email --- */
$subjectLine = $subject !== '' ? $subject : 'Nouvelle demande de contact';
$mailSubject = '[Monarch Consulting] ' . $subjectLine;

$body  = "Nouveau message depuis le site Monarch Consulting\n";
$body .= "-------------------------------------------------\n\n";
$body .= "Nom       : $name\n";
$body .= "Email     : $email\n";
$body .= "Téléphone : " . ($phone !== '' ? $phone : '—') . "\n";
$body .= "Objet     : $subjectLine\n\n";
$body .= "Message :\n$message\n\n";
$body .= "-------------------------------------------------\n";
$body .= "Envoyé le " . date('d/m/Y à H:i') . "\n";

/* En-têtes. From = adresse du domaine (requis par IONOS) ; Reply-To = visiteur. */
$fromAddress = 'no-reply@monarch-consulting-io.com';
$headers  = "From: Monarch Consulting <$fromAddress>\r\n";
$headers .= "Reply-To: " . $name . " <" . $email . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

/* --- Envoi --- */
$sent = @mail($DEST, '=?UTF-8?B?' . base64_encode($mailSubject) . '?=', $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true, 'msg' => 'Merci, votre message a bien été envoyé. Nous vous répondrons rapidement.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => "L'envoi a échoué. Vous pouvez nous écrire directement à $DEST."]);
}
