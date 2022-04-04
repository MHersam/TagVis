## Install and run server

### Prerequisites 
Make sure Python is installed, you can download it here: https://www.python.org/downloads/ (Python 3.8 was tested)

### Recommended 
If you have a NVIDIA GPU available, make sure to have CUDA toolkit installed to run document embedding on your GPU. If CUDA is not detected, the CPU is used to embed documents, which is significantly slower. CUDA Toolkit can be downloaded from https://developer.nvidia.com/cuda-downloads (CUDA toolkit version 10.2 was tested)<br>


### Requirements
1. Change directory to ~/tagvis/specter with `cd specter`
2. Install PyTorch, the installation can vary based on your OS and CUDA toolkit version. (e.g. `pip install torch==1.8.0 torchvision==0.9.0 torchaudio==0.8.0` for Linux with CUDA 10.2, you can select your parameters and get a command you need to run at https://pytorch.org/)<br>
3. Install other dependencies: `pip install Flask`<b> and </b>`pip install --upgrade transformers==4.2`

### Run
Run the flask server: `flask run`<br>
If everything worked, the flask server should now be running on http://127.0.0.1:5000/

### Troubleshooting

If you're using CUDA and encounter 'RuntimeError: CUDA out of memory', you have to decrease the batch size (the variable batchSize is defined in the first line in ~/tagvis/specter/app.py. From my experience: batchSize=4 worked with 8GB of VRAM and batchSize=1 worked with 4GB of VRAM)
