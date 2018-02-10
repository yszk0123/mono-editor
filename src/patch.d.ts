declare module 'slate-react';
declare module 'slate-md-serializer';
declare module 'slate-soft-break';
declare module 'slate';

declare module 'slate-auto-replace' {
  export default function AutoReplace(init: {
    trigger?: string;
    before?: RegExp;
    after?: RegExp;
    onlyIn?: string;
    ignoreIn?: string;
    transform(transform: any, e: any, matches: any): any;
  }): any;
}
