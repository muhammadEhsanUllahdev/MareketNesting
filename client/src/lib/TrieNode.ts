class TrieNode {
  children = new Map<string, TrieNode>();
  isEndOfWord = false;
  originalWord?: string;
}

export class Trie {
  root = new TrieNode();

  insert(word: string) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfWord = true;
    node.originalWord = word; // ✅ Preserve original casing
  }

  getWordsWithPrefix(prefix: string): string[] {
    const results: string[] = [];
    let node = this.root;

    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) return results;
      node = node.children.get(char)!;
    }

    const dfs = (curr: TrieNode) => {
      if (curr.isEndOfWord && curr.originalWord) {
        results.push(curr.originalWord);
      }
      for (const [, child] of curr.children) {
        dfs(child);
      }
    };

    dfs(node);
    return results;
  }
}

export default TrieNode;
