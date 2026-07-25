import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import type { FileTransaction } from '../types';

export const getTransactions = async (): Promise<FileTransaction[]> => {
  try {
    return await invoke<FileTransaction[]>('get_transactions');
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

export const getModelInfo = async (): Promise<{ model: string; available: boolean }> => {
  try {
    return await invoke<{ model: string; available: boolean }>('get_model_info');
  } catch {
    return { model: 'qwen3.5:4b', available: false };
  }
};

export const undoTransaction = async (id: string): Promise<FileTransaction> => {
  return await invoke<FileTransaction>('undo_transaction', { id });
};

export const runBatchProcessing = async (): Promise<number> => {
  return await invoke<number>('run_batch_processing');
};

export const extractFileContent = async (filePath: string): Promise<string> => {
  return await invoke<string>('extract_file_content', { filePath });
};

export const getMcpTools = async (): Promise<unknown> => {
  return await invoke<unknown>('get_mcp_tools');
};

export const openExternalUrl = async (url: string): Promise<void> => {
  try {
    await open(url);
  } catch (error) {
    console.error('Failed to open URL via shell plugin:', error);
    window.open(url, '_blank');
  }
};
