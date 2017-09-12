export CC=gcc-5; export CXX=g++-5
export INSTALL_PREFIX=$HOME/opt
export LD_LIBRARY_PATH=$INSTALL_PREFIX/lib
export LIBRARY_PATH=$INSTALL_PREFIX/lib
export PKG_CONFIG_PATH=$INSTALL_PREFIX/lib/pkgconfig
export AK_SDK_INCLUDE=$HOME/project/wwise_main/SDK/include
export AK_AUTO_INCLUDE=$HOME/project/wwise_main/Automotive/common/include
export CONTROL_LUA_PATH=~/agl/afb-ak-demo/conf.d/project/lua.d
export CONTROL_CONFIG_PATH=~/agl/afb-ak-demo/conf.d/project/json.d
PATH=$INSTALL_PREFIX/bin:$PATH 
RSYNC_TARGET=MY_TARGET_HOSTNAME
RSYNC_PREFIX=./opt
  
