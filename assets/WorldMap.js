// assets/WorldMap.js
import React from 'react';
import { SvgXml } from 'react-native-svg';
import worldMapSvg from './worldMapString';

export default function WorldMap({ highlightCountry }) {
  // Regex to replace the fill for the matching country
  const svgString = worldMapSvg.replace(
    new RegExp(`(data-name="${highlightCountry}"[^>]*fill=")[^"]*`, 'i'),
    `$1#e53935` // highlight color
  );

  return <SvgXml xml={svgString} width="100%" height="100%" />;
}
