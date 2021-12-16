import { getAddress } from 'ethers/lib/utils';
import Vibrant from 'node-vibrant';
import { shade } from 'polished';
import { useLayoutEffect, useState } from 'react';
import { hex } from 'wcag-contrast';

import { TokenInfo } from '../types';

/**
 * Given a URI that may be ipfs, ipns, http, or https protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
export default function uriToHttp(uri: string): string[] {
    const protocol = uri.split(':')[0].toLowerCase();
    switch (protocol) {
      case 'https':
        return [uri];
      case 'http':
        return ['https' + uri.substr(4), uri];
      case 'ipfs':
        const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        return [`https://cloudflare-ipfs.com/ipfs/${hash}/`, `https://ipfs.io/ipfs/${hash}/`];
      case 'ipns':
        const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
        return [`https://cloudflare-ipfs.com/ipns/${name}/`, `https://ipfs.io/ipns/${name}/`];
      default:
        return [];
    }
  }

async function getColorFromToken(token: TokenInfo): Promise<string | null> {
  if (token.chainId !== 1) {
    return Promise.resolve('#FAAB14');
  }
  const address = getAddress(token.address);

  const path = `https://raw.githubusercontent.com/uniswap/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

  return Vibrant.from(path)
    .getPalette()
    .then(palette => {
      if (palette?.Vibrant) {
        let detectedHex = palette.Vibrant.hex;
        let AAscore = hex(detectedHex, '#FFF');
        while (AAscore < 3) {
          detectedHex = shade(0.005, detectedHex);
          AAscore = hex(detectedHex, '#FFF');
        }
        return detectedHex;
      }
      return null;
    })
    .catch(() => null);
}

async function getColorFromUriPath(uri: string): Promise<string | null> {
  const formattedPath = uriToHttp(uri)[0];

  return Vibrant.from(formattedPath)
    .getPalette()
    .then(palette => {
      if (palette?.Vibrant) {
        return palette.Vibrant.hex;
      }
      return null;
    })
    .catch(() => null);
}

export function useColor(token?: TokenInfo) {
  const [color, setColor] = useState('#000');

  useLayoutEffect(() => {
    let stale = false;

    if (token) {
      getColorFromToken(token).then(tokenColor => {
        if (!stale && tokenColor !== null) {
          setColor(tokenColor);
        }
      });
    }

    return () => {
      stale = true;
      setColor('#000');
    };
  }, [token]);

  return color;
}

export function useListColor(listImageUri?: string) {
  const [color, setColor] = useState('#000');

  useLayoutEffect(() => {
    let stale = false;

    if (listImageUri) {
      getColorFromUriPath(listImageUri).then(color => {
        if (!stale && color !== null) {
          setColor(color);
        }
      });
    }

    return () => {
      stale = true;
      setColor('#000');
    };
  }, [listImageUri]);

  return color;
}
