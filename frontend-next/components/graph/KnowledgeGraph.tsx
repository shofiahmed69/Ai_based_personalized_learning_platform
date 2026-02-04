'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import type { Tag, TagRelationship } from '@/lib/types';

interface KnowledgeGraphProps {
  nodes: Tag[];
  edges: TagRelationship[];
}

interface NodeDatum extends Tag {
  x?: number;
  y?: number;
}

export function KnowledgeGraph({ nodes, edges }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth || 800;
    const height = 500;

    const svg = d3.select(svgRef.current).attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();
    const g = svg.append('g');

    const nodeById = new Map<string, NodeDatum>();
    const nodeData: NodeDatum[] = nodes.map((n) => {
      const nd: NodeDatum = { ...n, x: width / 2 + (Math.random() - 0.5) * 200, y: height / 2 + (Math.random() - 0.5) * 200 };
      nodeById.set(n.id, nd);
      return nd;
    });

    const linkData = edges
      .filter((e) => nodeById.has(e.source_tag_id) && nodeById.has(e.target_tag_id))
      .map((e) => ({
        source: nodeById.get(e.source_tag_id)!,
        target: nodeById.get(e.target_tag_id)!,
        relationship: e.relationship,
      }));

    const link = g
      .selectAll<SVGLineElement, { source: NodeDatum; target: NodeDatum; relationship: string }>('line')
      .data(linkData)
      .join('line')
      .attr('stroke', (d) =>
        d.relationship === 'IS_A' ? '#8b5cf6' : d.relationship === 'PART_OF' ? '#10b981' : '#6b7280'
      )
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6);

    const node = g
      .selectAll<SVGGElement, NodeDatum>('g')
      .data(nodeData)
      .join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, NodeDatum>()
          .on('drag', (event, d) => {
            d.x = event.x;
            d.y = event.y;
            tick();
          })
      );

    node.append('circle').attr('r', 12).attr('fill', '#8b5cf6').attr('stroke', '#a78bfa').attr('stroke-width', 2);
    node.append('text').attr('dy', 24).attr('text-anchor', 'middle').attr('fill', '#e5e7eb').attr('font-size', 11).text((d) => d.name);

    const simulation = d3
      .forceSimulation<NodeDatum>(nodeData)
      .force(
        'link',
        d3.forceLink(linkData).id((d) => (d as NodeDatum).id).distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    function tick() {
      link
        .attr('x1', (d) => d.source.x ?? 0)
        .attr('y1', (d) => d.source.y ?? 0)
        .attr('x2', (d) => d.target.x ?? 0)
        .attr('y2', (d) => d.target.y ?? 0);
      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    }

    simulation.on('tick', tick);

    node.on('click', (_, d) => {
      router.push(`/documents?tag=${d.slug}`);
    });

    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }, [nodes, edges, router]);

  return <svg ref={svgRef} className="w-full" style={{ minHeight: 500 }} />;
}
