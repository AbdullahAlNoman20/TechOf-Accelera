import useCollection from './useCollection';

/** Pipeline stages are configurable (Deal Pipeline > Pipeline settings). Returns them in order. */
export default function useStages() {
  const { items } = useCollection('pipelineStages');
  const stages = [...items].sort((a, b) => a.order - b.order);
  return { stages, byId: Object.fromEntries(stages.map((s) => [s.id, s])), ids: stages.map((s) => s.id), open: stages.filter((s) => s.type === 'open').map((s) => s.id) };
}
