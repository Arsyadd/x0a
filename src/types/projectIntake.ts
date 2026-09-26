export interface ProjectSourceFile {
  name: string;
  content: string;
}

export interface ProjectIntake {
  prompt: string;
  ecosystemHint?: string;
  files: ProjectSourceFile[];
  links: string[];
  dynamicNetworks?: DynamicNetworkOption[];
}

export interface DynamicNetworkOption {
  id: string;
  ecosystem: string;
  networkName: string;
  chain: string;
  chainName?: string;
  chainId: string;
  networkId: string;
  isTestnet: boolean;
}