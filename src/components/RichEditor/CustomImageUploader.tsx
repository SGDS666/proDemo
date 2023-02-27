// @ts-nocheck #
import type { FileInfo, File } from '@aomao/engine';
import { getExtensionName, isAndroid, isEngine } from '@aomao/engine';
import { ImageComponent, ImageUploader } from '@aomao/plugin-image';
// import { ImageValue } from 'plugins/image/dist/component';
// 继承原 ImageUploader 类，重写 execute 方法
class CustomizeImageUploader extends ImageUploader {
  // 当前上传中的卡片实例
  private imageComponents: Record<string, ImageComponent> = {};
  // 上传前处理图片，获取图片的base64在上传等待中显示在编辑器中
  handleBefore(uid: string, file: File) {
    const { type, name, size } = file;
    // 获取文件后缀名
    const ext = getExtensionName(file);
    // 异步读取文件
    return new Promise<false | { file: File; info: FileInfo }>((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.addEventListener(
        'load',
        () => {
          resolve({
            file,
            info: {
              // 唯一编号
              uid,
              // Blob
              src: fileReader.result,
              // 文件名称
              name,
              // 文件大小
              size,
              // 文件类型
              type,
              // 文件后缀名
              ext,
            },
          });
        },
        false,
      );
      fileReader.addEventListener('error', () => {
        reject(false);
      });
      fileReader.readAsDataURL(file);
    });
  }
  // 上传前插入编辑器
  onReady(fileInfo: FileInfo) {
    // 如果当前图片的 ImageComponent 实例存在就不处理
    if (!isEngine(this.editor) || !!this.imageComponents[fileInfo.uid]) return;
    // 插入ImageComponent 卡片
    const component = this.editor.card.insert(ImageComponent.cardName, {
      // 设置状态为上传中
      status: 'uploading',
      // 显示在 handleBefore 中获取的 base64 图片，这样不会导致编辑器区域空白
      src: fileInfo.src,
    }) as ImageComponent;
    // 记录当前上传文件的 卡片实例
    this.imageComponents[fileInfo.uid] = component;
  }
  // 上传中
  onUploading(uid: string, { percent }: { percent: number }) {
    // 获取file 对应的 ImageComponent 实例
    const component = this.imageComponents[uid];
    if (!component) return;
    // 设置当前上传进度百分比
    component.setProgressPercent(percent);
  }
  // 上传成功
  onSuccess(response: any, uid: string) {
    // 获取file 对应的 ImageComponent 实例
    const component = this.imageComponents[uid];
    if (!component) return;
    // 获取上传成功后的图片地址
    let src = '';
    // 处理服务端返回的 response，如果上传出错就更新对应 file 对应的 ImageComponent 实例的状态值
    if (response.code !== 200) {
      // 更新卡片的值
      this.editor.card.update(component.id, {
        status: 'error',
        message: response.msg || this.editor.language.get('image', 'uploadError'),
      });
    } else {
      // 上传成功
      src = response.data.url;
    }
    // 设置为file 对应的 ImageComponent 实例的状态值为 done
    const value: any = {
      status: 'done',
      src,
    };
    // 有获取的上传图片后的url
    if (src) {
      // 调用 ImageUploader 当前实例的方法去加载这个 url 图片，如果加载失败，就设置状态为error并显示无法加载，否则就正常加载图片
      this.loadImage(component.id, value);
    }
    // 删除当前的临时记录
    delete this.imageComponents[uid];
  }

  // 上传出错
  onError(error: Error, uid: string) {
    const component = this.imageComponents[uid];
    if (!component) return;
    // 更新卡片状态为 error，并显示错误信息
    this.editor.card.update(component.id, {
      status: 'error',
      message: error.message || this.editor.language.get('image', 'uploadError'),
    });
    // 删除当前的临时记录
    delete this.imageComponents[uid];
  }

  async execute(files?: File[] | string | MouseEvent) {
    // 是阅读器View就不处理
    if (!isEngine(this.editor)) return;
    // 获取当前传入的可选项值
    const { request, language } = this.editor;
    const { multiple } = this.options.file;
    // 上传大小限制
    const limitSize = this.options.file.limitSize || 5 * 1024 * 1024;
    // 传入的files不是数组获取不是图片地址，那就是 MouseEvent 弹出文件选择器
    if (!Array.isArray(files) && typeof files !== 'string') {
      // 弹出文件选择器，让用户选择文件
      // eslint-disable-next-line no-param-reassign
      files = await request.getFiles({
        // 用户目标的单击事件
        event: files,
        // 可选取的文件后缀名称。this.extensionNames 是 ImageUploader 插件内默认支持的后缀和可选项传进来的后缀合并后的值
        accept: isAndroid
          ? 'image/*'
          : this.extensionNames.length > 0
          ? '.' + this.extensionNames.join(',.')
          : '',
        // 最多可选取数量
        multiple,
      });
    }
    // 如果传入的文件地址，那就执行图片地址的上传，insertRemote 如果判断是非本站第三方网站图片地址就会请求api到服务端下载然后服务端存储后再返回新的图片地址
    // 因为非本站第三方网站的图片可能存在跨域或者无法访问的情况，建议进行后端下载处理
    else if (typeof files === 'string') {
      this.insertRemote(files);
      return;
    }
    // 如果没有任何文件就不处理
    if (files.length === 0) return;
    const promiseList = [];
    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      // 当前上传文件唯一标识
      const uid = Date.now() + '-' + f;
      // 判断文件大小
      if (file.size > limitSize) {
        // 显示错误
        this.editor.messageError(
          language
            .get<string>('image', 'uploadLimitError')
            .replace('$size', (limitSize / 1024 / 1024).toFixed(0) + 'M'),
        );
        return;
      }
      promiseList.push(this.handleBefore(uid, file));
    }
    //全部图片读取完成后再插入编辑器
    Promise.all(promiseList).then((values) => {
      if (values.some((value) => value === false)) {
        this.editor.messageError('read image failed');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const files = values as { file: File; info: FileInfo }[];
      files.forEach((v) => {
        // 插入编辑器
        this.onReady(v.info);
      });
      // 处理上传
      this.handleUpload(files);
    });
  }

  /**
   * 处理文件上传
   * @param values
   */
  handleUpload(values: { file: File; info: FileInfo }[]) {
    const files = values.map((v) => {
      v.file.uid = v.info.uid;
      return v.file;
    });
    // 自定义上传方法
    this.editor.request.upload(
      {
        url: this.options.file.action,
        ...this.options.file,
        onUploading: (file, percent) => {
          this.onUploading(file.uid || '', percent);
        },
        onSuccess: (response, file) => {
          this.onSuccess(response, file.uid || '');
        },
        onError: (error, file) => {
          this.onError(error, file.uid || '');
        },
      },
      files,
    );
  }
}

export default CustomizeImageUploader;
