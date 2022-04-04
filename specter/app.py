batchSize=4
from queue import PriorityQueue
from flask import Flask
from flask import request
from flask import jsonify
app = Flask(__name__)

# simple script for embedding papers using huggingface Specter
from transformers import AutoModel, AutoTokenizer
import json
from tqdm.auto import tqdm
import torch
#from random import randint
from time import sleep
import queue as Q
import string
import random
threaded=True
device = 'cpu'
if torch.cuda.is_available():
    print("using cuda")
    device = 'cuda'
else:
    print("using cpu")
    device = 'cpu'

class Dataset:

    def __init__(self, data, max_length=512, batch_size=32):
        self.tokenizer = AutoTokenizer.from_pretrained('allenai/specter')
        self.max_length = max_length
        self.batch_size = batch_size
        self.data = data
    def __len__(self):
        return len(self.data)

    def batches(self):
        # create batches
        batch = []
        batch_ids = []
        batch_size = self.batch_size
        i = 0
        for k, d in self.data.items():
            if (i) % batch_size != 0 or i == 0:
                batch_ids.append(k)
                batch.append(d['title'] + ' ' + (d.get('abstract') or ''))
            else:
                input_ids = self.tokenizer(batch, padding=True, truncation=True, 
                                           return_tensors="pt", max_length=self.max_length)
                yield input_ids.to(device), batch_ids
                batch_ids = [k]
                batch = [d['title'] + ' ' + (d.get('abstract') or '')]
            i += 1
        if len(batch) > 0:
            input_ids = self.tokenizer(batch, padding=True, truncation=True, 
                                       return_tensors="pt", max_length=self.max_length)        
            input_ids = input_ids.to(device)
            yield input_ids, batch_ids
            
class Model:

    def __init__(self):
        self.model = AutoModel.from_pretrained('allenai/specter')
        self.model.to(device)
        self.model.eval()

    def __call__(self, input_ids):
        output = self.model(**input_ids)
        return output.last_hidden_state[:, 0, :] # cls token

model = Model()
lock = False
priorityQueue = Q.PriorityQueue()
nextFromPriorityQueue = "None"
@app.route('/', methods=['GET', 'POST'])
def index():
    global lock
    global priorityQueue
    global nextFromPriorityQueue
    global batchSize
    reqId = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(16))
    priorityQueue.put((request.args.get("priority"), reqId))
    dataset = Dataset(data=request.json, batch_size=batchSize)
    results = {}
    batches = []
    if nextFromPriorityQueue == "None" and lock == False:
        nextFromPriorityQueue = priorityQueue.get()[1]
    # TODO: bad practice, e.g. use events or async/await instead
    while nextFromPriorityQueue != reqId or lock == True:
        sleep(0.1)
    lock = True
    for batch, batch_ids in tqdm(dataset.batches(), total=len(dataset) // batchSize):
        batches.append(batch)
        emb = model(batch)
        for paper_id, embedding in zip(batch_ids, emb.unbind()):
            results[paper_id] =  {"paper_id": paper_id, "embedding": embedding.detach().cpu().numpy().tolist()}
    r=[]
    if priorityQueue.qsize() != 0:
        print("setting next")
        nextFromPriorityQueue = priorityQueue.get()[1]
    else:
        print("setting none")
        nextFromPriorityQueue = "None"
    lock = False
    for res in results.values():
        r.append(json.dumps(res))
    del dataset
    del results
    del batches
    print("qsize="+str(priorityQueue.qsize())+" lock="+str(lock)+" next="+nextFromPriorityQueue)
    #print(torch.cuda.max_memory_allocated())
    return jsonify(r)
