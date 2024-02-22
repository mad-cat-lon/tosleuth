from langchain.prompts import StringPromptTemplate
from pydantic import BaseModel, validator

# PROMPT = """
# <s>[INST]
# You are an expert lawyer analyzing terms of service agreements. Given a statement about the service and 4 pieces of text extracted from its documents, pick the number of the text that can directly provide an answer to the query. Output a valid JSON object containing the choice of text and your reasoning. If none of the texts can explicitly answer the statement, return 0. If there is a text that answers the question, set the "answer" field to true. In all other cases, set it to false. 
# Here is an example:
# Given the statement "You sign away all moral rights", which of the following texts, if any, answer it?

# 1) "you irrevocably waive any claims and assertions of moral rights or attribution with respect to Your Content."

# 2) "We reserve the right to modify, suspend, or discontinue the Services (in whole or in part) at any time"

# 3) "You will not license, sell, or transfer your Account without our prior written approval."

# 4) "By submitting Your Content to the Services, you represent and warrant that you have all rights, power, and authority necessary to grant the rights to Your Content contained within these Terms. Because you alone are responsible for Your 
# Content, you may expose yourself to liability if you post or share Content without all necessary rights."
# {{
#     "choice": 1,
#     "reason": "This text explicitly mentions that the user waives moral rights with respect to their content, which aligns with the statement. The other texts do not directly address moral rights and are unrelated to the given statement.",
#     "answer": true
# }}
# Given the statement "{query}", which texts answer it directly? Answer in JSON.
# 1) {result1}

# 2) {result2}

# 3) {result3}

# 4) {result4}
# [/INST]
# """

PROMPT = """
<|system|>
You are an expert lawyer analyzing terms of service agreements. Given a statement about the service and 4 pieces of text extracted from its documents, pick the number of the text that can directly provide an answer to the query. Output a valid JSON object containing the choice of text and concise reasoning. If none of the texts can explicitly answer the statement, return 0. If there is a text that answers the question, set the "answer" field to true. In all other cases, set it to false. 
Here are some examples: 

Given the statement "You sign away all moral rights", which of the following texts, if any, answer it?

1)
```
"you irrevocably waive any claims and assertions of moral rights or attribution with respect to Your Content."
```
2)
```
"We reserve the right to modify, suspend, or discontinue the Services (in whole or in part) at any time"
```
3)
```
"You will not license, sell, or transfer your Account without our prior written approval."
```
4)
```"By submitting Your Content to the Services, you represent and warrant that you have all rights, power, and authority necessary to grant the rights to Your Content contained within these Terms. Because you alone are responsible for Your 
Content, you may expose yourself to liability if you post or share Content without all necessary rights."
```
{{
    "choice": 1,
    "reason": "This text explicitly mentions that the user waives moral rights with respect to their content, which aligns with the statement. The other texts do not directly address moral rights and are unrelated to the given statement.",
    "answer": true
}}

Given the statement "Your biometric data is collected", which of the following texts, if any, answer it?
1)
```
We need this information to be able to recognize you, for example, when you
access your accounts. It also helps us to protect your details and keep them
secure. We may also use this information for fraud detection and prevention.
```
2)
```
We have set out below an overview of how our privacy notices work. Depending
on how you interact with us, we will collect and process your personal
information as shown below.
```
3)
```
HOW WE USE YOUR PERSONAL DATA
```
4)
```
**Information we use to identify and authenticate you**
```
{{
    "choice": 0,
    "reason": "The provided texts mention data collection and authentication, but none specifically mention the collection of biometric data.",
    "answer": false
}}
</s>
<|user|>
Given the statement "{query}", which text provides enough context to explicitly answer it? Do not infer or imply anything not provided in the texts. Answer with a single JSON object as demonstrated above.
1)
```
{result1}
```
2)
```
{result2}
```
3)
```
{result3}
```
4)
```
{result4}
```
</s>
<|assistant|>
"""

n_results = 4

class RAGQueryPromptTemplate(StringPromptTemplate, BaseModel):
    """
    Custom prompt template that takes in the query (a TOSDR case like "This service can read your messages")
    and formats the prompt template to provide the query and the 4 texts returned from the vector store
    """
    
    def format(self, **kwargs) -> str:
        prompt = PROMPT.format(
            query=kwargs["query"],
            result1=kwargs["results"][0],
            result2=kwargs["results"][1],
            result3=kwargs["results"][2],
            result4=kwargs["results"][3],
        )
        return prompt
    
