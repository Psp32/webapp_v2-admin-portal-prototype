'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  className?: string;
  style?: React.CSSProperties;
  height?: number | string;
}

export function EChart({ option, className, style, height }: EChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const instance = echarts.init(chartRef.current);
    instanceRef.current = instance;
    instance.setOption(option);

    const resize = () => instance.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      instance.dispose();
    };
  }, [option]);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.setOption(option);
    }
  }, [option]);

  const mergedStyle = height ? { height, ...style } : style;

  return <div ref={chartRef} className={className} style={mergedStyle} />;
}
