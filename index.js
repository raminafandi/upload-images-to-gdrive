const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const drive = require('./drive.js');
const path = require('path');
const Sharp = require('sharp');

const storage = multer.diskStorage({
	destination: (request, file, callback) => {
		callback(null, './uploads');
	},
	filename: (request, file, callback) => {
		// console.log("file", file);
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 100000000
	},
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	}
})

// Check File Type
function checkFileType(file, cb) {
	// Allowed ext
	const filetypes = /jpeg|jpg|png|gif/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb('Error: Images Only!');
	}
}

const port = 3000;
app.use(express.static(__dirname));


app.post('/avatar', async (request, response) => {
	upload.single('avatar')(request, response, async (err) => { // 'avatar' MUST match <input type="file" name="avatar" />
		if (err) {
			console.log('Error Occured', err);
			response.send(err);
			return;
		}
		// console.log(request.file);
		var fileName = request.file.filename;
		await Sharp(request.file.path)
			.resize(720, 480)
			.toFile("optimized/" + fileName, function (err) {
				console.log(err);
			});
		//Delete original file:

		var filePath = "optimized/" + fileName;
		// response.end('Your avatar Uploaded');
		let fileId = "";
		fileId = await drive.uploadFile(fileName, filePath);

		console.log("fID:" + fileId)
		// console.log('avatar Uploaded');
	})
});

app.post('/photos', (request, response) => {
	upload.array('photos')(request, response, (err) => { // 'photos' MUST match <input type="file" name="photos" />
		if (err) {
			console.log('Error Occured', err);
			response.send(err);
			return;
		}
		console.log(request.file)
		response.end('Your photos Uploaded');
		console.log('photos Uploaded');
	})
});

app.listen(port, () => {
	console.log("App listening on port " + port)
});