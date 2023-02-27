import { apiFileGetAuth, apiFileSaveLog } from '@/services/file';
const OSS = require('ali-oss');

export const uploadFile = async (file: any, saveType: string, log: boolean): Promise<any> => {
  const result = { success: false, data: {}, error: '' };
  try {
    const { name, type, size } = file;
    const names = name.split('.');
    const now = Date.now();
    const fileType = names[names.length - 1].toLowerCase();
    const { success, data, message, status } = await apiFileGetAuth({ type: saveType });
    if (!success) {
      return { success, error: message, status };
    }
    const {
      SecurityToken,
      AccessKeyId,
      AccessKeySecret,
      region,
      bucket,
      uid,
      dirName,
      id,
      webSite,
    } = data;
    const options: any = { timeout: 360000 };
    let savePath = `${saveType}/${dirName}/${id}_${now}.${fileType}`;
    if (saveType === 'att') {
      options['Content-Disposition'] = 'attachment';
      options['Cache-Control'] = 'no-cache';
      savePath = `${saveType}/${dirName}/${id}/${name}`;
    }

    const client = new OSS({
      bucket,
      region,
      accessKeyId: AccessKeyId,
      accessKeySecret: AccessKeySecret,
      stsToken: SecurityToken,
    });
    const res = await client.put(savePath, file, options);
    let url = res.url;
    if (webSite) {
      url = `${webSite}/${savePath}`;
    }
    const filePath = res.name;
    if (log) {
      result.data = await apiFileSaveLog({
        iid: id,
        id,
        name,
        url,
        filePath,
        bucket,
        region,
        filename: `${id}.${fileType}`,
        dirName,
        uid,
        fileType: type,
        type: saveType,
        size,
      });
    } else {
      result.data = {
        name,
        url,
        filePath,
        bucket,
        region,
        filename: `${id}.${fileType}`,
        dirName,
        uid,
        fileType: type,
        type: saveType,
        size,
        iid: id,
        id,
      };
    }
    result.success = true;
  } catch (err: any) {
    const { message: msg } = err;
    result.error = msg;
  }
  return result;
};

export const getBuffer = async (savePath: string) => {
  const result = { success: false, data: null, error: '' };
  if (!savePath) {
    return result;
  }
  try {
    const { success, data, message } = await apiFileGetAuth({ type: 'inbox' });
    if (!success) {
      return { success, error: message };
    }
    const { SecurityToken, AccessKeyId, AccessKeySecret, region, bucket } = data;
    const options = { timeout: 300000 };
    const client = new OSS({
      bucket,
      region,
      accessKeyId: AccessKeyId,
      accessKeySecret: AccessKeySecret,
      stsToken: SecurityToken,
    });
    const res = await client.get(savePath, options);
    result.data = res.content;
    result.success = true;
  } catch (err: any) {
    const { message: msg } = err;
    result.error = msg;
  }
  return result;
};
