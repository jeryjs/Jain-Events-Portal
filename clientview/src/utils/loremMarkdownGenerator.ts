/**
 * Lorem Ipsum Markdown Generator
 * Generates realistic markdown content for testing and prototyping purposes.
 */

// Dictionary of lorem ipsum words for generating text
const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
    'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
    'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat',
    'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

// Generate a random number between min and max (inclusive)
const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random word from the loremWords array
const randomWord = (): string => {
    return loremWords[randomInt(0, loremWords.length - 1)];
};

// Generate a sentence with a random number of words
const generateSentence = (minWords = 5, maxWords = 15): string => {
    const wordCount = randomInt(minWords, maxWords);
    let sentence = randomWord().charAt(0).toUpperCase() + randomWord().slice(1);
    
    for (let i = 1; i < wordCount; i++) {
        sentence += ' ' + randomWord();
    }
    
    return sentence + '.';
};

// Generate a paragraph with a random number of sentences
const generateParagraph = (minSentences = 3, maxSentences = 7): string => {
    const sentenceCount = randomInt(minSentences, maxSentences);
    let paragraph = '';
    
    for (let i = 0; i < sentenceCount; i++) {
        paragraph += generateSentence() + ' ';
    }
    
    return paragraph.trim();
};

// Generate a heading with a specified level (1-6)
const generateHeading = (level: number = 2): string => {
    const headingText = generateSentence(2, 7).replace('.', '');
    return '#'.repeat(level) + ' ' + headingText;
};

// Generate a list (ordered or unordered)
const generateList = (ordered: boolean = false, items: number = 5): string => {
    let list = '';
    
    for (let i = 0; i < items; i++) {
        const prefix = ordered ? `${i + 1}.` : '-';
        list += `${prefix} ${generateSentence(3, 10)}\n`;
    }
    
    return list;
};

// Generate a code block with a specified language
const generateCodeBlock = (language: string = 'javascript'): string => {
    const codeSnippets: Record<string, string> = {
        javascript: `function example() {\n  const value = Math.random();\n  return value > 0.5 ? "Higher" : "Lower";\n}`,
        typescript: `function calculateSum(a: number, b: number): number {\n  return a + b;\n}`,
        python: `def fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b`,
        html: `<div class="container">\n  <h1>Hello World</h1>\n  <p>This is an example paragraph.</p>\n</div>`,
        css: `.button {\n  background-color: #4CAF50;\n  border: none;\n  color: white;\n  padding: 15px 32px;\n  text-align: center;\n}`,
        bash: `#!/bin/bash\necho "Starting script..."\nfor i in {1..5}; do\n  echo "Processing item $i"\ndone`
    };
    
    const code = codeSnippets[language] || codeSnippets.javascript;
    return '```' + language + '\n' + code + '\n```';
};

// Generate a blockquote
const generateBlockquote = (): string => {
    return `> ${generateSentence(5, 15)}\n> \n> ${generateSentence(5, 15)}`;
};

// Generate a table with specified rows and columns
const generateTable = (rows: number = 4, cols: number = 3): string => {
    let table = '';
    
    // Generate header row
    table += '| ' + Array(cols).fill(0).map((_, i) => `Column ${i + 1}`).join(' | ') + ' |\n';
    
    // Generate separator row
    table += '| ' + Array(cols).fill('---').join(' | ') + ' |\n';
    
    // Generate data rows
    for (let i = 0; i < rows; i++) {
        table += '| ' + Array(cols).fill(0).map(() => randomWord() + ' ' + randomWord()).join(' | ') + ' |\n';
    }
    
    return table;
};

// Generate a link
const generateLink = (): string => {
    const text = generateSentence(2, 4).replace('.', '');
    const url = `https://example.com/${randomWord()}-${randomWord()}`;
    return `[${text}](${url})`;
};

// Generate an image reference
const generateImage = (): string => {
    const alt = generateSentence(2, 4).replace('.', '');
    const width = randomInt(300, 800);
    const height = randomInt(200, 600);
    return `![${alt}](https://picsum.photos/${width}/${height})`;
};

// Main function to generate markdown content
export const generateLoremMarkdown = (
    paragraphs: number = 5,
    includeHeadings: boolean = true,
    includeLists: boolean = true,
    includeCode: boolean = true,
    includeBlockquotes: boolean = true,
    includeTables: boolean = true,
    includeLinks: boolean = true,
    includeImages: boolean = true
): string => {
    let markdown = '';
    
    // Add a main heading
    markdown += `# ${generateSentence(3, 8).replace('.', '')}\n\n`;
    
    // Add an introduction paragraph
    markdown += generateParagraph() + '\n\n';
    
    // Generate content sections
    for (let i = 0; i < paragraphs; i++) {
        // Maybe add a heading
        if (includeHeadings && Math.random() > 0.3) {
            markdown += generateHeading(randomInt(2, 4)) + '\n\n';
        }
        
        // Add a paragraph
        markdown += generateParagraph() + '\n\n';
        
        // Maybe add a list
        if (includeLists && Math.random() > 0.6) {
            markdown += generateList(Math.random() > 0.5, randomInt(3, 7)) + '\n';
        }
        
        // Maybe add a code block
        if (includeCode && Math.random() > 0.7) {
            const languages = ['javascript', 'typescript', 'python', 'html', 'css', 'bash'];
            const language = languages[randomInt(0, languages.length - 1)];
            markdown += generateCodeBlock(language) + '\n\n';
        }
        
        // Maybe add a blockquote
        if (includeBlockquotes && Math.random() > 0.7) {
            markdown += generateBlockquote() + '\n\n';
        }
        
        // Maybe add a table
        if (includeTables && Math.random() > 0.8) {
            markdown += generateTable(randomInt(3, 6), randomInt(2, 5)) + '\n\n';
        }
        
        // Add another paragraph
        markdown += generateParagraph() + '\n\n';
        
        // Maybe add some links
        if (includeLinks && Math.random() > 0.5) {
            markdown += `${generateSentence(3, 8)} ${generateLink()} ${generateSentence(3, 8)}\n\n`;
        }
        
        // Maybe add an image
        if (includeImages && Math.random() > 0.7) {
            markdown += generateImage() + '\n\n';
        }
    }
    
    return markdown.trim();
};

// Export utility functions for more granular control
export default {
    generateLoremMarkdown,
    generateSentence,
    generateParagraph,
    generateHeading,
    generateList,
    generateCodeBlock,
    generateBlockquote,
    generateTable,
    generateLink,
    generateImage
};