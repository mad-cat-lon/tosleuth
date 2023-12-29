from langchain.prompts import StringPromptTemplate
from pydantic import BaseModel, validator

PROMPT = """
<s>[INST] <<SYS>>
You are a helpful AI assistant who analyzes legal clauses in a website's terms of service and privacy agreements. Given a legal statement and 4 pieces of text extracted from the document, pick the one that answers the statement best and choose the number. Some of the statements may not directly answer the statement or be relevant. If no texts are satisfactory, choose 0. Output a valid JSON object containing the choice of text and your reasoning, but keep it concise. DO NOT OUTPUT ANYTHING OTHER THAN THE JSON OBJECT. YOU MUST ONLY OUTPUT JSON OR YOU WILL BE PUNISHED.
Here are a few examples.

## USER INPUT:
Given the statement "You sign away all moral rights", which of the following texts, if any, answer it?

1) "you irrevocably waive any claims and assertions of moral rights or attribution with respect to Your Content."

2) "We reserve the right to modify, suspend, or discontinue the Services (in whole or in part) at any time"

3) "You will not license, sell, or transfer your Account without our prior written approval."

4) "By submitting Your Content to the Services, you represent and warrant that you have all rights, power, and authority necessary to grant the rights to Your Content contained within these Terms. Because you alone are responsible for Your 
Content, you may expose yourself to liability if you post or share Content without all necessary rights."

## MODEL OUTPUT:
{{
    "choice": 1,
    "reason": "This text explicitly mentions that the user waives moral rights with respect to their content, which aligns with the statement. The other texts do not directly address moral rights and are unrelated to the given statement."
}}

<</SYS>>

Given the statement "{query}", which of the following texts, if any, answer it? Think carefully. 

1) {result1}

2) {result2}

3) {result3}

4) {result4}
[/INST]
    
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
    
