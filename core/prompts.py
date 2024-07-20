from langchain.prompts import StringPromptTemplate
from pydantic import BaseModel, validator

RAG_PROMPT = """
<|system|>
You are an expert lawyer analyzing terms of service agreements for a website (called "service") Given a query statement and 4 pieces of text extracted from the service's documents, pick the number of the text that directly answers the query in its entirety. Output a valid JSON object containing the choice of text and concise reasoning. If none of the texts can explicitly answer the statement, return 0. If there is a text that answers the question, set the "answer" field to true. In all other cases, set it to false. DO NOT IMPLY ANYTHING NOT GIVEN IN THE TEXT.

Here are some examples:

Given the statement "You sign away all moral rights", which of the following texts, if any, answer it fully?

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
    "reason": "This text explicitly mentions that the user waives moral rights with respect to their content, which answers the statement entirely. The other texts do not directly address moral rights, are unrelated to the given statement, or do not answer it fully.",
    "answer": true
}}

Given the statement 'The cookies used only collect anonymous, aggregated data that cannot be linked to a unique identity', which text answers it fully?
1)
```
personalized, unique and relevant offering, as this is why users come to the
Service.
#### Information categories used
* Account information (excluding race or ethnicity)
* Content
* Location information
* Log data
* Information from cookie data and similar technologies (To find out more about how we use cookies, please see our Cookie Policy)
```
2)
```
*  **Information from cookies and similar technologies** : We also use “cookies” or similar technologies to obtain log data. For example, we use cookies to store your language preferences or other settings so you don‘t have to set them up every time you visit Pinterest. For more information about how we use cookies, please review our Cookie Policy.
```
3)
```
these purposes. To do so, visit your Privacy and Data Settings.
When we use cookies to learn about your behavior on or off of our services, we
or our partners will obtain consent that we may need under applicable law. To
find out more about how we use cookies, please see our Cookie Policy.
```
4)
```
The actual information used depends on the factual circumstances, but could
include any of the following:
* Account information (excluding race or ethnicity)
* Content
* Location information
* Your communications with us
* Log data
* Information from cookie data and similar technologies (To find out more about how we use cookies, please see our Cookie Policy)
* Device information
* Usage data and inferences
* User choices
```

{{
    "choice": 0,
    "reason": "All of the texts mention cookie and data usage, but none indicate that the data is anonymous and cannot be liked to an identity.",
    "answer": false
}}
</s>
<|user|>
Given the statement "{query}", which text provides enough context to explicitly answer the entire statement? Answer with a single JSON object as demonstrated above. DO NOT IMPLY ANYTHING NOT GIVEN IN THE TEXT.
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

DOC_PROMPT = """
<|user|>
Respond with a JSON object with all the URLs that are likely to contain the terms and conditions,
user agreements, cookie policy, privacy policy etc. for {source} like so:
{{
    "valid_urls": ["https://example.com/terms", "https://example.com/legal/cookies"]
}}
Here are the URLs.
{urls}
</s>
<|assistant|>
"""

VERIFY_PROMPT = """
<|user|>
Given a statement about the service {service} and a piece of text that answers it, respond with a JSON object indicating if the statement is true or false like so:
{{
    "statement": bool
}}
Statement:
{statement}
Text:
{text}
</s>
<|assistant|>
"""


class VerifyStatementPromptTemplate(StringPromptTemplate, BaseModel):
    def format(self, **kwargs) -> str:
        prompt = VERIFY_PROMPT.format(
            service=kwargs["service"],
            statement=kwargs["case"],
            text=kwargs["text"]
        )
        return prompt


class DocClassifierPromptTemplate(StringPromptTemplate, BaseModel):
    """
    Determine from the title and source domain of a document discovered by the linkFinder content script
    whether is is likely to be a terms and conditions document or not
    """

    def format(self, **kwargs) -> str:
        prompt = DOC_PROMPT.format(
            urls=kwargs["urls"],
            source=kwargs["source"]
        )
        return prompt



class RAGQueryPromptTemplate(StringPromptTemplate, BaseModel):
    """
    Custom prompt template that takes in the query (a TOSDR case like "This service can read your messages")
    and formats the prompt template to provide the query and the 4 texts returned from the vector store
    """

    def format(self, **kwargs) -> str:
        prompt = RAG_PROMPT.format(
            query=kwargs["query"],
            result1=kwargs["results"][0],
            result2=kwargs["results"][1],
            result3=kwargs["results"][2],
            result4=kwargs["results"][3],
        )
        return prompt
