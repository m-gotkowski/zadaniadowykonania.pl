<?php



if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['message'])) {
	
	$m_to = null;
	$m_from = $_POST['email'];
	
	$m_header = 'MIME-Version: 1.0' . "\r\n";
	$m_header .= 'Content-type: text/html; charset=utf-8' . "\r\n";
	$m_header .= 'From: ' . $m_from . "\r\n";
	$m_header .= 'X-Mailer: PHP/' . phpversion();
	
	if ($m_to === null) {
		print 0;
	}
	else {
		
		$m_html = '
<html>
<head>
  <title>Wiadomość z projektu...</title>
</head>
<body>
  <p>Wiadomość od: ' . $_POST['name'] . '</p>
  <br />
  <p>' . $_POST['message'] . '</p>
</body>
</html>
';
		
		mail($m_to, 'Wiadomość z projektu...', $m_html, $m_header);
		
		print 1;
	}
}

?>