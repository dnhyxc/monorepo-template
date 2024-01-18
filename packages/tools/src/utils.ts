export const getNameInfo = (name: string): string => {
  return 'my name is ' + name;
};

// 计算资源加载的进度
export const calculateLoadProgress = ({
  url,
  getProgress,
  needFileType = 'arrayBuffer',
  previousReader,
  addPreviousReader
}: {
  url: string;
  getProgress: (progress: number) => void;
  previousReader: any;
  addPreviousReader: (previousReader: any) => void;
  needFileType?: string;
}): Promise<ArrayBuffer | unknown> => {
  let contentLength = '';
  let totalBytes = 0;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`资源加载失败: ${response.status} ${response.statusText}`);
      }
      contentLength = response.headers.get('content-length') as string;
      totalBytes = parseInt(contentLength, 10);
      let loadedBytes = 0;
      // 如果上一个读取器存在，则取消它
      if (previousReader) {
        previousReader.cancel();
        addPreviousReader && addPreviousReader(null);
      }
      const reader = response.body?.getReader();
      // 将当前读取器保存为上一个读取器
      addPreviousReader && addPreviousReader(reader);
      const chunks = [] as Uint8Array[];
      const readChunk = (): unknown => {
        return reader!.read().then(({ done, value }) => {
          if (done) {
            return chunks;
          }
          loadedBytes += value.byteLength;
          const progress = Math.round((loadedBytes / totalBytes) * 100);
          getProgress(progress);
          chunks.push(value);
          return readChunk();
        });
      };
      return readChunk();
    })
    .then((_chunks: unknown) => {
      if (needFileType === 'blob') {
        const blob = new Blob(_chunks as BlobPart[], { type: 'application/pdf' });
        if (blob?.size < totalBytes) {
          return new Promise((resolve) => {
            resolve(null);
          });
        } else {
          return new Promise((resolve) => {
            resolve(blob);
          });
        }
      } else {
        const blob = new Blob(_chunks as BlobPart[]);
        if (blob?.size < totalBytes) {
          return new Promise((resolve) => {
            resolve(null);
          });
        } else {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsArrayBuffer(blob);
          });
        }
      }
    })
    .catch((error) => {
      console.error('资源加载失败:', error);
    });
};

// 搜索关键词高亮
export const hlightKeyword = (keyword: string, list: Array<any>) => {
  const reg = new RegExp(keyword, 'gi');
  return list.map((i) => {
    i.abstract = i.abstract?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.title = i.title?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.authorName = i.authorName?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.classify = i.classify?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.tag = i.tag?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    i.username = i.username?.replace(reg, (key: string) => `<span style="color: #ff9900">${key}</span>`);
    return i;
  });
};
