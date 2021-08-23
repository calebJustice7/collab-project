const router = require('express').Router();
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
});

let s3 = new AWS.S3();

function uploadImage(params, options) {
    return new Promise((resolve, reject) => {
        s3.upload(params, options, (err, data) => {
            if (err) {
                console.log(err, 'err on img uploading');
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function deleteImage(params) {
    return new Promise((resolve, reject) => {
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err, 'err on img deleting');
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

router.post('/delete', async(req, res) => {
    if (!req.body.key) {
        res.json({ success: false, message: 'Must provide image key' });
    } else {
        deleteImage({ Key: req.body.key, Bucket: 'collab-bucket-test' }).then(data => {
            res.json({ success: true, data: data })
        }).catch(er => {
            res.json({ message: er.message, success: false });
        })
    }
})

router.post('/create', async(req, res) => {
    if (!req.body.name || !req.body.fileData) {
        res.json({ success: false, message: 'Must provde an image' });
    } else {
        let today = new Date();
        let options = {
            partSize: 10 * 1024 * 1024,
            queueSize: 1
        };

        let uniqueName = {
            path: `${req.body.type}/${req.body.category}/${today.getFullYear().toString()}${today.getMonth().toString().padStart(2, '0')}/`,
            file: `collab_${req.body.name.replace(/[^a-zA-Z0-9.]/g, '')}`
        };
        let params = {
            Bucket: 'collab-bucket-test',
            Key: uniqueName.path + uniqueName.file + Date.now(),
            Body: req.body.fileData,
            // ContentEncoding: 'base64',
            ContentType: req.body.type,
            ACL: 'public-read'
        };

        uploadImage(params, options).then(data => {
            res.json({ data, success: true });
        }).catch(er => res.json({
            message: er.message,
            success: false
        }));
    }
})

router.post('/', (req, res) => {
    const params = {
        Key: req.body.key,
        Bucket: 'collab-bucket-test'
    };
    let stream = s3.getObject(params).createReadStream();
    stream.pipe(res);
});

module.exports = router;