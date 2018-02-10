/* tslint:disable no-console */
import * as React from 'react';
import { Editor } from 'slate-react';
import Markdown from 'slate-md-serializer';
import AutoReplace from 'slate-auto-replace';
import SoftBreak from 'slate-soft-break';
import { Value } from 'slate';
import 'github-markdown-css';
import './App.css';

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      },
    ],
  },
});

enum NodeType {
  Paragraph = 'paragraph',
  BlockQuote = 'block-quote',
  BulletedList = 'bulleted-list',
  OrderedList = 'ordered-list',
  TodoList = 'todo-list',
  Table = 'table',
  TableRow = 'table-row',
  TableHead = 'table-head',
  TableCell = 'table-cell',
  ListItem = 'list-item',
  HorizontalRule = 'horizontal-rule',
  Code = 'code',
  Image = 'image',
  Link = 'link',
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Heading3 = 'heading3',
}

enum MarkType {
  Bold = 'bold',
  Code = 'code',
  Italic = 'italic',
  Underlined = 'underlined',
  Deleted = 'deleted',
  Added = 'added',
}

function Foo() {
  return {
    onKeyDown(event: KeyboardEvent, change: any) {
      const { value } = change;
      if (event.key !== 'Enter') {
        return;
      }
      const { startBlock } = value;
      const { type } = startBlock;
      console.log('type', startBlock);
      // TODO 親ノードに移動して、新規ブロック list-item を作る必要がある
      return change.splitBlock();
    },
  };
}

const plugins = [
  Foo(),
  SoftBreak({
    onlyIn: ['code', 'block-quote'],
  }),
  SoftBreak({
    ignoreIn: ['code', 'block-quote'],
    shift: true,
  }),
  AutoReplace({
    trigger: 'space',
    before: /```$/,
    transform(transform: any, e: any, matches: any) {
      return transform.setBlock({ type: 'code' });
    },
    onlyIn: 'paragraph',
  }),
  AutoReplace({
    trigger: 'space',
    before: /```$/,
    transform(transform: any, e: any, matches: any) {
      return transform.setBlock({ type: 'paragraph' });
    },
    onlyIn: 'code',
  }),
  AutoReplace({
    trigger: 'space',
    before: /^(>)$/,
    transform(transform: any, e: any, matches: any) {
      return transform.setBlock({ type: 'block-quote' });
    },
  }),
  AutoReplace({
    trigger: 'space',
    before: /^(-)$/,
    transform(transform: any, e: any, matches: any) {
      return transform.setBlock('list-item').wrapBlock('bulleted-list');
    },
  }),
  AutoReplace({
    trigger: 'space',
    before: /^(#{1,3})$/,
    transform(transform: any, event: any, matches: any) {
      const [hashes] = matches.before;
      const level = hashes.length;
      return transform.setBlock({
        type: `heading${level}`,
      });
    },
  }),
  AutoReplace({
    trigger: 'enter',
    before: /^(-{3})$/,
    transform(transform: any, event: any, matches: any) {
      return transform.setBlock({
        type: 'horizontal-rule',
        isVoid: true,
      });
    },
  }),
];

const markdown = new Markdown();
let v;

interface Props {}

interface State {
  value: any;
}

export default class App extends React.Component<Props, State> {
  state = {
    value: (v = markdown.deserialize(
      `
# foo

- baz

- [x] hoge
  - [ ] fuga

> quote

\`\`\`
code
\`\`\`

hhh
`.replace(/^(\s*)- (\[[\sx]\])/gm, '$1$2'),
    )),
  };

  onChange = ({ value }: { value: any }) => {
    this.setState({ value });
  };

  renderNode = (props: any) => {
    const { attributes } = props;

    switch (props.node.type) {
      case NodeType.Paragraph:
        return <p {...attributes}>{props.children}</p>;
      case NodeType.BlockQuote:
        return <blockquote {...attributes}>{props.children}</blockquote>;
      case NodeType.BulletedList:
        return <ul {...attributes}>{props.children}</ul>;
      case NodeType.OrderedList:
        return <ol {...attributes}>{props.children}</ol>;
      case NodeType.TodoList:
        return <ul {...attributes}>{props.children}</ul>;
      case NodeType.Table:
        return <table {...attributes}>{props.children}</table>;
      case NodeType.TableRow:
        return <tr {...attributes}>{props.children}</tr>;
      case NodeType.TableHead:
        return <th {...attributes}>{props.children}</th>;
      case NodeType.TableCell:
        return <td {...attributes}>{props.children}</td>;
      case NodeType.ListItem:
        const checked = props.node.getIn(['data', 'checked']);
        return (
          <li {...attributes}>
            {checked != null ? (
              <input
                className="checkbox"
                type="checkbox"
                defaultChecked={checked}
              />
            ) : null}
            {props.children}
          </li>
        );
      case NodeType.HorizontalRule:
        return <hr />;
      case NodeType.Code:
        return <code {...attributes}>{props.children}</code>;
      case NodeType.Image:
        return <img src={props.src} alt={props.title} title={props.title} />;
      case NodeType.Link:
        return <a href={props.href}>{props.children}</a>;
      case NodeType.Heading1:
        return <h1 {...attributes}>{props.children}</h1>;
      case NodeType.Heading2:
        return <h2 {...attributes}>{props.children}</h2>;
      case NodeType.Heading3:
        return <h3 {...attributes}>{props.children}</h3>;
      default:
    }
  };

  renderMark = ({ mark, children }: any) => {
    switch (mark.type) {
      case MarkType.Bold:
        return <strong>{children}</strong>;
      case MarkType.Code:
        return <code>{children}</code>;
      case MarkType.Italic:
        return <em>{children}</em>;
      case MarkType.Underlined:
        return <u>{children}</u>;
      case MarkType.Deleted:
        return <del>{children}</del>;
      case MarkType.Added:
        return <mark>{children}</mark>;
      default:
    }
  };

  render() {
    return (
      <div>
        Hello!
        <div className="markdown-body">
          <Editor
            value={this.state.value}
            onChange={this.onChange}
            renderNode={this.renderNode}
            plugins={plugins}
          />
        </div>
        <hr />
        <button onClick={e => console.log(this.state.value.toJSON())}>
          SHOW VALUE
        </button>
        <pre>
          {markdown
            .serialize(this.state.value)
            .replace(/^(\s*)(\[[\sx]\])/gm, '$1- $2')}
        </pre>
      </div>
    );
  }
}
