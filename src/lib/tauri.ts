import { invoke } from '@tauri-apps/api/core';
import type { FileTransaction } from '../types';

export const getTransactions = async (): Promise<FileTransaction[]> => {
  try {
    return await invoke<FileTransaction[]>('get_transactions');
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

export const undoTransaction = async (id: string): Promise<FileTransaction> => {
  return await invoke<FileTransaction>('undo_transaction', { id });
};

export const extractFileContent = async (filePath: string): Promise<string> => {
  return await invoke<string>('extract_file_content', { filePath });
};

export const getMcpTools = async (): Promise<unknown> => {
  return await invoke<unknown>('get_mcp_tools');
};
