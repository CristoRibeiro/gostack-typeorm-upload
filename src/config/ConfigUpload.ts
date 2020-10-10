import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const directory = path.resolve(__dirname, '..', '..', 'tmp');
export default {
  directory,
  storage: multer.diskStorage({
    destination: directory,
    filename: (request, file, callback) => {
      const hash = crypto.randomBytes(10).toString('hex');
      const HashedFileName = `${hash} - ${file.originalname}`;

      callback(null, HashedFileName);
    },
  }),
};
