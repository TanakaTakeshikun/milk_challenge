const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { google } = require('googleapis');
const setting = require('../setting.json');
const { Readable } = require('stream');

const axios = require('axios');
require('dotenv').config();
const serviceAccountAuth = new JWT({
  email: process.env.email,
  key: process.env.PRIVATEKEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/documents'],
});

class GCP {
  /**
   * コンストラクター
   * @param {*} spreadsheetKey スプレッドシートキー
   */
  constructor() {
    this.doc = new GoogleSpreadsheet(setting.spreadsheet, serviceAccountAuth);
    this.drive = google.drive({ version: 'v3', auth: serviceAccountAuth });
  }
  async save({ num, title, author, i, content }) {
    const userId = globalThis.usertmp.get(i.user.id).filter(x => x);
    const Base64 = async (url) => {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer'
        });
        return { type: response.headers['content-type'], data: Readable.from(Buffer.from(response.data)) }
      } catch (error) {
        globalThis.usertmp.delete(i.user.id)
        console.error(error)
        return;
      }
    }
    const folderId = setting.drive;
    const folder_params = {
      fields: 'id',
      requestBody: {
        name: `No.${num}_${author}`,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folderId]
      }
    };
    const res = await this.drive.files.create(folder_params).catch((e) => {
      globalThis.usertmp.delete(i.user.id)
      console.error(e)
    });
    if (!res) return { error: "エラー1" }
    let count = 1;
    for (const item of userId) {
      const image = await Base64(item);
      if (!image) return { error: "エラー2" }
      const image_params = {
        resource: {
          name: `${author}_${title}_${count}`,
          parents: [res.data.id]
        },
        media: {
          mimeType: image.type,
          body: image.data
        }
      };
      const check = await this.drive.files.create(image_params).catch((e) => {
        globalThis.usertmp.delete(i.user.id)
        console.error(e)
      });
      if (!check) return { error: "エラー3" }
      count++;
    }
    const text_params = {
      requestBody: {
        name: `作品名:${title}`,
        mimeType: 'application/vnd.google-apps.document',
        parents: [res.data.id],
      },
      media: {
        mimeType: 'text/plain',
        body: content
      }
    };
    const docs = await this.drive.files.create(text_params).catch((e) => {
      globalThis.usertmp.delete(i.user.id)
      console.error(e)
    });
    if (!docs) return { error: "エラー4" }
    return `https://drive.google.com/drive/folders/${res.data.id}`
  }
  /**
   * 行を追加する
   * @param {*} value 
   */
  async set({ type, userId, userName, num, title, description, author, url }) {
    if (type !== 'userdata') return 'Not Type';
    const check = await this.doc.loadInfo().catch(e => e);
    if (check) {
      globalThis.usertmp.delete(userId)
      return { error: "エラー6" + e }
    };
    const sheet = this.doc.sheetsByTitle[type];
    await sheet.addRow({ userId: userId, userName: userName, author: author, title: title, description: description, Date: new Date(), No: num, url: url });
  }
  async getRows({ type }) {
    if (type !== 'userdata') return 'Not Type';
    const check = await this.doc.loadInfo().catch(e => e);
    if (check) {
      globalThis.usertmp.delete(userId)
      return { error: "エラー6" + e }
    };
    const sheet = this.doc.sheetsByTitle[type];
    return sheet.getRows();
  }
}

module.exports = GCP