------------------------------------------------------------------------
                  Audiokinetic AGL Demo
------------------------------------------------------------------------

# Cloning Audiokinetic AGL Demo
-------------------------------------------------------

```
# Initial clone with submodules
git clone https://github.com/Audiokinetic-Automotive/ak-demo.git

```

# Dependencies
--------------------------------------------------------

This demo need three other bindings afb-aaaa, afb-audiohighlevel and afb-audiobackend.
Below are the github repositories, please follow each repo instruction to properly compile and deploy them.

```
# afb-audiohighlevel
git clone git@github.com:Audiokinetic-Automotive/afb-audiohighlevel.git

# afb-audiobackend
git clone git@github.com:Audiokinetic-Automotive/afb-audiobackend.git

#afb-aaaa (fork branch)
git clone --recurse-submodules git@github.com:huetaivuong/afb-aaaa.git

```

# Audio High Level Configuration
--------------------------------------------------------
Create the following folder and copy audiohighlevel binding configuration over it.


```

mkdir ~/opt/config
cd ak-demo
cp conf.d/project/json.d/ahl-config.json ~/opt/config/

```

# ALSA Configuration
--------------------------------------------------------
An ALSA configuration example is provided at the following location:

ak-demo/project/alsa.d/asoundrc.demo

Copy asoundrc.demo to your local ~/.asoundrc

Edit the files to match your system ALSA configuration. 
Particularly the ALSA card number need to be edit and modify to match your configuration.


The demo is configure to use 3 ALSA cards to provide 3 audio zones (main, DriverHR, RSE)

