export interface WalletData {
  name: string;
  creator: string;
  allowedUsers: string[];
}

export interface Wallet extends WalletData {
  _id: string;
  __v: number;
}
