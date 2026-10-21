import { BeauError, sseData } from './domain.ts';
export type ProviderResult = {text:string;input:number;cached:number;output:number};
export async function generate(options: {key:string;model:string;instructions:string;input:{role:string;content:string}[];maxOutput:number;intelligence:boolean;signal:AbortSignal;onDelta:(text:string)=>void;fetcher?:typeof fetch}): Promise<ProviderResult> {
  const reasoning=/^gpt-5\.(4|6)(?:-|$)/.test(options.model)?{effort:options.intelligence?'low':'none'}:undefined;
  const response = await (options.fetcher || fetch)('https://api.openai.com/v1/responses', {
    method:'POST',headers:{Authorization:`Bearer ${options.key}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:options.model,instructions:options.instructions,input:options.input,stream:true,store:false,max_output_tokens:options.maxOutput,...(reasoning?{reasoning}:{})}),signal:options.signal,
  });
  if(!response.ok || !response.body) {
    // Do not read or echo upstream error bodies, which could contain sensitive data.
    throw new BeauError('provider_unavailable',response.status===429?'BEAU is busy or its API allowance is unavailable. Please try again later.':'The AI service is unavailable. Please try again later.',503);
  }
  let full=''; let completed=false; let usage:{input_tokens?:number;output_tokens?:number;input_tokens_details?:{cached_tokens?:number}} = {};
  for await (const event of sseData(response.body)) {
    if(event.type==='response.output_text.delta' && typeof event.delta==='string') { full+=event.delta; options.onDelta(event.delta); }
    if(event.type==='response.completed') { const result=event.response as {usage?:typeof usage}; usage=result?.usage || {}; completed=true; }
    if(event.type==='response.failed' || event.type==='response.incomplete' || event.type==='error') throw new BeauError('stream_incomplete','BEAU could not finish this answer. You can try again.',503);
  }
  if(!completed || !full || !Number.isInteger(usage.input_tokens) || !Number.isInteger(usage.output_tokens)) throw new BeauError('stream_incomplete','The answer was interrupted. Please try again.',503);
  return {text:full,input:usage.input_tokens!,cached:usage.input_tokens_details?.cached_tokens || 0,output:usage.output_tokens!};
}
