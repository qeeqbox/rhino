find . | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
sudo rm -rf folders
#ffmpeg -i rhino.mp4 -vf "fps=5,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" -loop 0 output.gif
