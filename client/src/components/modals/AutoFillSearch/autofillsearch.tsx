import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Trie } from "@/lib/TrieNode";

import * as LucideIcons from "lucide-react";
import React, { useState } from "react";

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  // const iconNames = Object.keys(LucideIcons).sort();
  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.Package;
  console.log("all icon names:", Object.keys(LucideIcons));
  const iconNames = Array.isArray(Object.keys(LucideIcons))
    ? Object.keys(LucideIcons).sort()
    : [];

  const trie = React.useMemo(() => {
    const t = new Trie();
    iconNames.forEach((name) => t.insert(name));
    return t;
  }, [iconNames]);
  const exactMatches = trie.getWordsWithPrefix(query);
  const fuzzyMatches = getFuzzyMatches(iconNames, query);
  const filteredIcons = Array.from(
    new Set([...exactMatches, ...fuzzyMatches])
  ).slice(0, 10);

  function getFuzzyMatches(
    words: string[],
    query: string,
    maxDistance = 2
  ): string[] {
    const distance = (a: string, b: string): number => {
      const dp = Array(a.length + 1)
        .fill(null)
        .map(() => Array(b.length + 1).fill(0));

      for (let i = 0; i <= a.length; i++) dp[i][0] = i;
      for (let j = 0; j <= b.length; j++) dp[0][j] = j;

      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost =
            a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + cost // substitution
          );
        }
      }

      return dp[a.length][b.length];
    };

    return words.filter((word) => distance(word, query) <= maxDistance);
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 border rounded-md px-3 py-2 w-full text-left">
          <SelectedIcon className="h-4 w-4" />
          <span>{value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder="Search icon..."
            value={query}
            onInput={(e) => setQuery(e.currentTarget.value)}
          />

          <CommandList>
            <CommandEmpty>No icon found.</CommandEmpty>
            <CommandGroup>
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                return (
                  <CommandItem
                    key={iconName}
                    value={iconName}
                    onSelect={() => {
                      onChange(iconName);
                      setOpen(false);
                      setSearch(""); // reset search after selection
                    }}
                    className="flex items-center gap-2"
                  >
                    {/* <Icon className="h-4 w-4" /> */}
                    <span>{iconName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { IconPicker };
