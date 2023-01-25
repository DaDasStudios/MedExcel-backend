
export const emailHTMLBody = (body: string) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>MedExcel</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
	</head>
	<body>
        ${body}
	</body>
</html>
`