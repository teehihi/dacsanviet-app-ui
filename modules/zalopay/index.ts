import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { PayZaloBridge } = NativeModules;

export interface ZaloPayResult {
  returnCode: number; // 1 = success, 4 = canceled, -1 = app not installed
  transactionId?: string;
}

export function payWithZaloPay(zpTransToken: string): Promise<ZaloPayResult> {
  return new Promise((resolve) => {
    if (!PayZaloBridge) {
      resolve({ returnCode: -99 }); // Module not available
      return;
    }

    const emitter = new NativeEventEmitter(PayZaloBridge);
    const subscription = emitter.addListener('EventPayZalo', (data: ZaloPayResult) => {
      subscription.remove();
      resolve(data);
    });

    PayZaloBridge.payOrder(zpTransToken);
  });
}

export const isZaloPayAvailable = !!PayZaloBridge;
