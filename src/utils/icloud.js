import { invoke } from '@tauri-apps/api/core';

const SYNC_FILE_NAME = 'prompt_fill_sync.json';
const ICLOUD_CONTAINER_ID = 'iCloud.com.promptfill.app.v2';

/**
 * 检查是否在 Tauri 移动端环境
 */
const isTauriIOS = () => {
  return !!(window.__TAURI_INTERNALS__ && /iPhone|iPad|iPod/i.test(navigator.userAgent));
};

/**
 * 将数据上传到 iCloud 容器
 */
export const uploadToICloud = async (data) => {
  if (!isTauriIOS()) return null;
  
  const timestamp = Date.now();
  const content = JSON.stringify({
    version: '1.0',
    timestamp,
    payload: data
  });
  
  try {
    await invoke('icloud_write_text', {
      containerId: ICLOUD_CONTAINER_ID,
      relativePath: SYNC_FILE_NAME,
      contents: content
    });
    const exists = await invoke('icloud_exists', {
      containerId: ICLOUD_CONTAINER_ID,
      relativePath: SYNC_FILE_NAME
    });
    if (!exists) {
      return { ok: false, error: 'File not found after write' };
    }
    console.log('[iCloud] Data uploaded successfully');
    return { ok: true, timestamp };
  } catch (error) {
    console.error('[iCloud] Upload failed:', error);
    return { ok: false, error: String(error) };
  }
};

/**
 * 从 iCloud 下载数据
 */
export const downloadFromICloud = async () => {
  if (!isTauriIOS()) return null;

  try {
    const fileExists = await invoke('icloud_exists', {
      containerId: ICLOUD_CONTAINER_ID,
      relativePath: SYNC_FILE_NAME
    });
    if (!fileExists) return null;

    const content = await invoke('icloud_read_text', {
      containerId: ICLOUD_CONTAINER_ID,
      relativePath: SYNC_FILE_NAME
    });
    return JSON.parse(content);
  } catch (error) {
    console.error('[iCloud] Download failed:', error);
    return null;
  }
};
