def make_prompt(query_statement, vector_results=[]):
    prompt = f"""
<s>[INST] 
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

## USER INPUT: 
Given the statement "The service can delete specific content without prior notice and without a reason", which of the following texts, if any, answer it? Think carefully. 

1) "Also, please note that if you knowingly misrepresent that any activity or material on our Service is infringing, you may be liable to Reddit for certain costs and damages. If we remove Your Content in response to a copyright or trademark notice, we will notify you via Reddit’s private messaging system."

2)  "we may, in our sole discretion, delete or remove Your Content at any time and for any reason"

3) "You also agree that we may remove metadata associated with Your Content, and"

4) "If you believe Your Content was wrongly removed due to a mistake or misidentification in a copyright notice, you can send a counter notification via our Copyright Counter Notice Form or to our Copyright Agent (contact information provided above). Please see 17 U.S.C. § 512(g)(3) for the requirements of a proper counter notification."

## MODEL OUTPUT:
{{
    "choice": 2,
    "reason": "This text explicitly states that the service may delete content at any time and for any reason without prior notice, which aligns with the given statement. The other texts do not directly address this aspect of the service's behavior."
}}
<</SYS>>

Given the statement "{query_statement}", which of the following texts, if any, answer it? Think carefully. 

1) {vector_results[0]}

2) {vector_results[1]}

3) {vector_results[2]}

4) {vector_results[3]}
[/INST]
    
"""
    return prompt