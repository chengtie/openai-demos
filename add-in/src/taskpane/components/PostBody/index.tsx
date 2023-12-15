import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { a11yDark, vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
// import CodeCopyBtn from '../CodeCopyBtn';
// import { IconButton } from '@fluentui/react/lib/Button';
import './style.css';
import { ReactNode } from 'react';
import { CodeComponent, CodeProps } from 'react-markdown/lib/ast-to-react';
import markdown from 'remark-parse'
import { unified } from 'unified'
// import { Icon } from '@fluentui/react/lib/Icon';
// import { ISpreadsheetCommunicator } from '../../communicators/abstract-spreadsheet-communicator';
// import { SpreadsheetCommunicatorFactory } from '../../communicators/spreadsheet-communicator.factory';

const isTable = (markdownStr) => {
    const processor = new (unified as any)().use(markdown).use(rehypeRaw).use(remarkGfm)
    const ast = processor.parse(markdownStr)
  
    if (ast.children.length === 1 && ast.children[0].type === 'table') {
      return true
    }
  
    return false
}

const handleCopy = (textToCopy) => {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';  // This avoids scrolling to the bottom
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
};

function TableControlBar() {
    const [copyOk, setCopyOk] = React.useState(false);

    // const iconColor = copyOk ? '#0af20a' : '#ddd';
    const iconColor = copyOk ? 'green' : 'red';
    const icon = copyOk ? 'fa-check-square' : 'fa-copy';
    
    function getCellContent(cell) {
        const cellContent = cell.props.children[0];
        if (typeof cellContent === 'object' && cellContent !== null && 'props' in cellContent) {
            // an email
            return cellContent.props.children[0];
        } else if (Array.isArray(cellContent)) {
            return cellContent.join('');
        } else {
            // a string
            return String(cellContent);
        }
    }

    function reactTableToArray(reactTable) {
        let resultArray: any[][] = [];
      
        if (!reactTable || reactTable.length === 0) {
            return resultArray;
        }
      
        const header = reactTable[0].props.children[0];
        const body = reactTable[1].props.children;
      
        let headerArray = header.props.children.map(headerCell => getCellContent(headerCell));
        resultArray.push(headerArray);
      
        body.forEach((row) => {
            let rowArray = row.props.children.map(cell => getCellContent(cell));
            resultArray.push(rowArray);
        });
      
        return resultArray;
    }
      
    function reactTableToTabSeparatedString(reactTable) {
        let tabSeparatedString = '';
        
        if (!reactTable || reactTable.length === 0) {
            return tabSeparatedString;
        }
        
        const header = reactTable[0].props.children[0];
        const body = reactTable[1].props.children;
        
        header.props.children.forEach((headerCell, index) => {
            tabSeparatedString += getCellContent(headerCell);
            tabSeparatedString += (index < header.props.children.length - 1) ? '\t' : '\n';
        });
        
        body.forEach((row) => {
            row.props.children.forEach((cell, index) => {
                tabSeparatedString += getCellContent(cell);
                tabSeparatedString += (index < row.props.children.length - 1) ? '\t' : '\n';
            });
        });
        
        return tabSeparatedString;
    }

    return (
        <div style={{ display: "flex", justifyContent: "flex-end" }}> {/* backgroundColor: "#C8C8C8" */}
            {/* <span style={{ color: "green" }} onClick={handleCopy}>AbigButtonX</span> */}
            {/* <IconButton 
                // className="hide-if-large" 
                styles={{ icon: { fontSize: "14px", margin: "0px" }, root: { padding: "0px", marginRight: "-5px" }}}
                iconProps={{ iconName: 'Back' }} 
                // ariaLabel={t("Write to cell")}
                // title={t("Write the formula to the selected cell")}
                // onClick={this.onClickUnformatAndWrite} 
            /> */}
            {/* <IconButton 
                // className="hide-if-large" 
                styles={{ icon: { fontSize: "14px", margin: "0px" }, root: { padding: "0px", marginLeft: "-5px" }}}
                iconProps={{ iconName: "Copy" }} 
                onClick={handleCopy} /> */}
            {/* <div 
                onClick={() => { communicator.write_values(reactTableToArray(children)) }}
                style={{ cursor: "pointer", padding: "0px 5px 0px 0px", color: "rgb(33, 115, 70)" }}
                >
                <Icon iconName='Back' title={"Write the table to the selected cell"} styles={{ root: { fontSize: "12px" } }} />
            </div>
            <div 
                onClick={() => { handleCopy(reactTableToTabSeparatedString(children)) }}
                style={{ cursor: "pointer", padding: "0px 0px 0px 5px", color: "rgb(33, 115, 70)" }}
                >
                <Icon iconName='Copy' title={"Copy the table to the clipboard"} styles={{ root: { fontSize: "12px" } }} />
            </div> */}
        </div>
    )
}

const Table = ({ children }) => {
    // console.log("debugme, table children", children);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", overflowX: 'auto' }}> {/* overflowX: 'auto' for horizontal scrollbar */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}> {/* backgroundColor: "pink" */}
                <TableControlBar ></TableControlBar>
                <table style={{ marginBottom: "10px" }}> {/* backgroundColor: "yellow" */}
                    {children}
                </table>
            </div>
        </div>
    )
}

function PreControlBar({ children }) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "-0.5em" }}>
        <div 
            onClick={() => { handleCopy(children[0]?.props?.children || "") }}
            style={{ cursor: "pointer", padding: "0px 0px 0px 5px", color: "rgb(33, 115, 70)" }}
            >
            {/* <Icon iconName='Copy' styles={{ root: { fontSize: "16px" } }} /> */}
        </div>
        {/* <button onClick={() => { handleCopy(children[0]?.props?.children || "") }}>Copy</button> */}
        {/* Add more controls here */}
      </div>
    );
  }
    
// Add the CodeCopyBtn component to our PRE element
const Pre = ({ children }) => {
    // console.log("debugme, children", children);
    // Sometimes when gpt returns a table, it's possible that it's inside a PRE element
    // So we need to markdown-render such a table
    // `a working markdown table in preformatted code:\n\`\`\`\n| H   |\n| --- |\n| 100 |\n| 200 |\n| 300 |\n \`\`\``
    if (isTable(children[0].props.children[0])) {
        // console.log("it's a table")
        return (
            <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={{
                    table: (props) => <Table {...props} />,
                }}
            >
                {children[0].props.children[0]}
            </ReactMarkdown>
        )
    } else {
        return (
            <div>
                <PreControlBar>{children}</PreControlBar>
                <pre 
                    className="block-pre"
                    >
                    {/* <CodeCopyBtn>{children}</CodeCopyBtn> */}
                    {children}
                </pre>
            </div>
        )
    }
}

type ExtendedCodeProps = CodeProps & { openFormulaInEditor?: (formula: ReactNode) => void; };
  
const Code: React.FC<ExtendedCodeProps> = ({ node, inline, className = 'block-code', children, openFormulaInEditor, ...props }: ExtendedCodeProps) => {
    if (inline && Array.isArray(children) && children.length > 0 && (children[0] as string).startsWith("=")) {
        return (
            <span style={{display: "inline"}}>
                <code className={className} {...props}>
                    {children}
                </code>
                {/* <span 
                    style={{backgroundColor: "blue"}} 
                    onClick={() => {openFormulaInEditor?.(children[0])}}>
                    Trigger Formula Editor
                </span> */}
            </span>
        )
    }
    const match = /language-(\w+)/.exec(className || '');

    return !inline && match ? (
        <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const OList = ({ children }) => {
    return (
        <ol style={{ paddingLeft: "20px" }}> {/* this is necessary because a list exceeds the left border; we can remove it if there is lots of space on the left. */}
            {children}
        </ol>
    )
};

const UList = ({ children }) => {
    return (
        <ul style={{ paddingLeft: "20px" }}> {/* this is necessary because a list exceeds the left border; we can remove it if there is lots of space on the left. */}
            {children}
        </ul>
    )
};

export default function PostBody({ message, openFormulaInEditor }) {
    // const communicatorRef = useRef<ISpreadsheetCommunicator | null>(null);

    // useEffect(() => {
    //     communicatorRef.current = SpreadsheetCommunicatorFactory.createContextCommunicator();
    // }, []);

    if (message.role === "system") 
        return <></>

    if (message.contentDisplay && (message.contentDisplay !== ""))
        return <div style={{
            textAlign: "center",
            fontWeight: "bold",
            paddingBottom: "10px",
        }}>{message.contentDisplay}</div>
    
    return (
        <ReactMarkdown
            className='post-markdown'
            linkTarget='_blank'
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
                pre: Pre,
                table: (props) => <Table {...props} />,
                code: (codeProps) => <Code {...codeProps} openFormulaInEditor={openFormulaInEditor} />,
                ol: OList,
                ul: UList,
            }}
        >
            {message.content}
        </ReactMarkdown>
    )
}