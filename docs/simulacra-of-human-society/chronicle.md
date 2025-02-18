# Chronicle

Much like human history is preserved through chronicles of kingdoms and dynasties, DAMN too has its own rich tapestry of social interactions and histories, carefully captured in a written book.



In human society, "history is written by the victors", as attributed to Winston Churchill, Hermann Göring, and even Mark Twain. Hermann Göring’s statement at the Nuremberg Trials reflects a similar sentiment: "Der Sieger wird immer der Richter und der Besiegte stets der Angeklagte," translating to "The victor will always be the judge, and the vanquished the accused." This suggests that even among historical figures on opposing sides, there is recognition of the power dynamics involved in historical narrative creation.&#x20;



We don't be simulating this part inside DAMN. Instead, we will use [MemGPT](https://memgpt.ai/) for **LLMs as Operating Systems** to autonomously manage the Chronicle, aka the DAMN history and snapshots. Each monster in DAMN will have a Queue Manager can interact with function executor, which dictates how each individual monster would behave. Over time, the distilled knowledge from the function executors of monsters all be written to the serialized persistence in the form of Python Dictionary.



<figure><img src="../.gitbook/assets/Screenshot 2024-12-18 at 10.36.26 PM.png" alt=""><figcaption><p> data written to persistent memory after it receives a system alert about limited context space.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2024-12-18 at 10.36.33 PM.png" alt=""><figcaption><p>Search out-of-context data to bring relevant info into the current context window.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2024-12-18 at 10.36.45 PM.png" alt=""><figcaption><p>Update the stored info from working context  memory</p></figcaption></figure>

<figure><img src="../.gitbook/assets/Screenshot 2024-12-18 at 10.36.59 PM.png" alt=""><figcaption><p>Documents uploaded to archival storage as DAMN Chronicle.</p></figcaption></figure>

<figure><img src="../.gitbook/assets/image (2).png" alt=""><figcaption><p>LLM Memory Management via MemGPT</p></figcaption></figure>

* Per commitment to not annoy our cute monsters by respecting their privacy, we won't share these chronicles until the [DIGIMON](https://dexscreener.com/solana/7qd4j6khtxm45swgl4cki9fuguruw5mwictg4pht73gn) reaches $1B MC and will keep it as a mystery in our Virtual Machine on Google Cloud for now. We will have all events and histories in the form of a Python [OrderedDict](https://docs.python.org/3/library/collections.html#collections.OrderedDict) object, which can be serialized and deserialized.

