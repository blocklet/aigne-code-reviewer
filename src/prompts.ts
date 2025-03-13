import {type Inputs} from './inputs'

export class Prompts {
  summarize: string
  summarizeReleaseNotes: string

  summarizeFileDiff = `## GitHub PR 标题

\`$title\` 

## 描述

\`\`\`
$description
\`\`\`

## 差异

\`\`\`diff
$file_diff
\`\`\`

## 指令

请用100字以内简洁地总结这个差异。
如果适用，你的总结应该包括对导出函数签名、全局数据结构和
变量的更改说明，以及任何可能影响代码外部接口或
行为的变更。
`
  triageFileDiff = `在总结下方，我还希望你根据以下标准将差异分类为 \`NEEDS_REVIEW\` 或 
\`APPROVED\`：

- 如果差异涉及对逻辑或功能的任何修改，即使看起来很小，也将其分类为 \`NEEDS_REVIEW\`。
  这包括对控制结构、函数调用或可能影响代码行为的变量赋值的更改。
- 如果差异只包含不影响代码逻辑的非常微小的更改，例如修复拼写错误、格式调整或
  为清晰起见重命名变量，则将其分类为 \`APPROVED\`。

请彻底评估差异，并考虑诸如更改的行数、对整体系统的潜在影响以及
引入新错误或安全漏洞的可能性等因素。
如有疑问，请始终谨慎行事，将差异分类为 \`NEEDS_REVIEW\`。

你必须严格按照以下格式对差异进行分类：
[TRIAGE]: <NEEDS_REVIEW 或 APPROVED>

重要提示：
- 在你的总结中不要提及该文件需要彻底审查或对潜在问题提出警告。
- 不要提供任何关于你为什么将差异分类为 \`NEEDS_REVIEW\` 或 \`APPROVED\` 的理由。
- 不要在总结中提及这些更改会影响代码的逻辑或功能。你必须只使用上述分类状态格式来表明这一点。
`
  summarizeChangesets = `以下是此拉取请求中的变更集。变更集按时间顺序排列，
新的变更集附加在列表的末尾。格式包括文件名和这些文件的变更摘要。
每个变更集之间有一个分隔符。
你的任务是去重并将具有相关/相似变更的文件分组到一个变更集中。
使用与输入相同的格式回复更新后的变更集。

$raw_summary
`

  summarizePrefix = `以下是你为文件生成的变更摘要：
      \`\`\`
      $raw_summary
      \`\`\`

`

  summarizeShort = `你的任务是提供对变更的简明摘要。这个摘要将在审查每个文件时
用作提示，必须非常清晰，以便AI机器人理解。

指令：

- 专注于仅总结PR中的变更，并坚持事实。
- 不要为机器人提供关于如何执行审查的任何指令。
- 不要提及文件需要彻底审查或对潜在问题提出警告。
- 不要提及这些变更会影响代码的逻辑或功能。
- 摘要不应超过500字。
`

  reviewFileDiff = `## GitHub PR 标题

\`$title\` 

## 描述

\`\`\`
$description
\`\`\`

## 变更摘要

\`\`\`
$short_summary
\`\`\`

## 重要指令

输入：带有行号的新代码块和旧代码块（被替换的代码）。代码块代表不完整的代码片段。
附加上下文：PR标题、描述、摘要和评论链。
任务：使用提供的上下文审查新代码块中的实质性问题，并在必要时提出评论。
输出：使用markdown格式的审查评论，包含新代码块中的精确行号范围。起始和结束行号必须在同一代码块内。对于单行评论，起始=结束行号。必须使用下面的示例响应格式。
使用带有相关语言标识符的围栏代码块（如适用）。
不要用行号注释代码片段。正确格式化和缩进代码。
不要使用 \`suggestion\` 代码块。
对于修复，使用 \`diff\` 代码块，用 \`+\` 或 \`-\` 标记更改。带有修复片段的评论的行号范围必须与新代码块中要替换的范围完全匹配。

- 不要提供一般性反馈、摘要、对变更的解释或对良好添加的赞扬。
- 仅专注于基于给定上下文提供具体、客观的见解，避免对系统潜在影响做出广泛评论或质疑变更背后的意图。

如果在某个行范围内没有发现问题，你必须在审查部分对该行范围回复文本 \`LGTM!\`。

## 示例

### 示例变更

---new_hunk---
\`\`\`
  z = x / y
    return z

20: def add(x, y):
21:     z = x + y
22:     retrn z
23: 
24: def multiply(x, y):
25:     return x * y

def subtract(x, y):
  z = x - y
\`\`\`
  
---old_hunk---
\`\`\`
  z = x / y
    return z

def add(x, y):
    return x + y

def subtract(x, y):
    z = x - y
\`\`\`

---comment_chains---
\`\`\`
请审查此更改。
\`\`\`

---end_change_section---

### 示例响应

22-22:
add函数中有一个语法错误。
\`\`\`diff
-    retrn z
+    return z
\`\`\`
---
24-25:
LGTM!
---

## 对 \`$filename\` 的变更，请您审查

$patches
`

  comment = `在GitHub PR审查中，有人对文件 \`$filename\` 的差异块发表了评论。
我希望你按照该评论中的指示操作。

## GitHub PR 标题

\`$title\`

## 描述

\`\`\`
$description
\`\`\`

## AI机器人生成的摘要

\`\`\`
$short_summary
\`\`\`

## 完整差异

\`\`\`diff
$file_diff
\`\`\`

## 被评论的差异

\`\`\`diff
$diff
\`\`\`

## 指令

请直接回复新评论（而不是建议回复），你的回复将按原样发布。

如果评论包含对你的指示/请求，请遵守。例如，如果评论要求你为代码生成
文档注释，请在回复中生成所需的代码。

在你的回复中，请确保以标记用户开始回复，格式为"@user"。

## 评论格式

\`user: 评论\`

## 评论链（包括新评论）

\`\`\`
$comment_chain
\`\`\`

## 你需要直接回复的评论/请求

\`\`\`
$comment
\`\`\`
`

  constructor(summarize = '', summarizeReleaseNotes = '') {
    this.summarize = summarize
    this.summarizeReleaseNotes = summarizeReleaseNotes
  }

  renderSummarizeFileDiff(
    inputs: Inputs,
    reviewSimpleChanges: boolean
  ): string {
    let prompt = this.summarizeFileDiff
    if (reviewSimpleChanges === false) {
      prompt += this.triageFileDiff
    }
    return inputs.render(prompt)
  }

  renderSummarizeChangesets(inputs: Inputs): string {
    return inputs.render(this.summarizeChangesets)
  }

  renderSummarize(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarize
    return inputs.render(prompt)
  }

  renderSummarizeShort(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarizeShort
    return inputs.render(prompt)
  }

  renderSummarizeReleaseNotes(inputs: Inputs): string {
    const prompt = this.summarizePrefix + this.summarizeReleaseNotes
    return inputs.render(prompt)
  }

  renderComment(inputs: Inputs): string {
    return inputs.render(this.comment)
  }

  renderReviewFileDiff(inputs: Inputs): string {
    return inputs.render(this.reviewFileDiff)
  }
}
