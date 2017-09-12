--[[
  Copyright (C) 2016 "IoT.bzh"
  Author Fulup Ar Foll <fulup@iot.bzh>
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  
 
  Provide sample policy function for AGL Advance Audio Agent
--]]

-- Global HAL registry
_Audio_Hal_Registry={}

-- Callback when receiving HAL registry
function _Alsa_Get_Hal_CB (error, result, context)
   -- Initialise an empty table
   local registry={}

    -- Only process when response is valid
    if (error) then 
         AFB_ErrOr ("[Audio_Init_CB] ErrOr result=%s", result)
        return
    end

    -- Extract response from result
    local response=result["response"]

    -- Index HAL Bindings APIs by shortname
    for key,value in pairs(response) do
        registry[value["shortname"]]=value["api"]
    end
    
    -- store Exiting HAL for further use
    printf ("-- [Audio_Init_CB] -- Audio_register_Hal=%s", Dump_Table(registry))
    _Audio_Hal_Registry=registry
      
end

-- Function call at binding load time
function _Alsa_Get_Hal(args)

    printf ("[-- Audio_Get_Hal --] args=%s", Dump_Table(argsT))
    
    -- Query AlsaCore for Active HALs (no query, no context)
    AFB:service ('alsacore', 'hallist', {}, "_Alsa_Get_Hal_CB", {})
 
end

-- In sample configuration Query/Args parsing is common to all audio control
local function Audio_Parse_Request (source, args, query)

    local apihal={}

    -- In this test we expect targeted device to be given from query (could come for args as well)
    if (query == nil ) then
        AFB:error ("--LUA:Audio_Set_Navigation query should contain and args with targeted apihal|device")
        return  -- refuse control
    end

    -- Alsa Hook plugin asound sample config provides target sound card by name
    if (query["device"] ~= nil) then 
        apihal=_Audio_Hal_Registry[query["device"]]
    end

    -- HTML5 test page provides directly HAL api.
    if (query["apihal"] ~= nil) then
       apihal= query["apihal"]
    end

    -- if requested HAL is not found then deny the control
    if (apihal == nil) then
        AFB:error ("--LUA:Audio_Set_Navigation No Active HAL Found")
        return  -- refuse control
    end

    -- return api or nil when not found
    return apihal
end

-- Set Entertainment sound when play
function _Audio_Set_Entertainment(source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- if source < 0 then Alsa HookPlugin is closing PCM
    if (source < 0) then
        -- Ramp Up Multimedia channel synchronously
        ctlhal={['label']='Entertainment_Playback_Volume', ['val']=60}
        err, response= AFB:servsync (apihal, 'ctlset',ctlhal)
    else
        -- Ramp Down Multimedia channel synchronously
        ctlhal={['label']='Entertainment_Playback_Volume', ['val']=40}
        err, response= AFB:servsync (apihal, 'ctlset',ctlhal)
    end

    if (err) then 
        AFB:error("--LUA:Audio_Set_Entertainment halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end


-- Select Entertainment mode
function _Audio_Set_Guidance (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- if Entertainement control only increase volume on open
    if (source >= 0) then
        -- Ramp Down Entertainemnt channel synchronously
        ctlhal={['label']='Guidance_Playback_Volume', ['val']=70}
        err, response= AFB:servsync (apihal, 'ctlset',ctlhal)
    end

    if (err) then 
        AFB:error("--LUA:Audio_Set_Guidance halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Notification mode
function _Audio_Set_Notification (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- Notification control increase volume on open
    ctlhal={['label']='Notification_Playback_Volume', ['val']=80}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)


    if (err) then 
        AFB:error("--LUA:Audio_Set_Notification halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Communication mode
function _Audio_Set_Communication (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- Notification control increase volume on open
    ctlhal={['label']='Communication_Playback_Volume', ['val']=80}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)


    if (err) then 
        AFB:error("--LUA:Audio_Set_Communication halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Communication mode
function _Audio_Set_System (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- Notification control increase volume on open
    ctlhal={['label']='System_Playback_Volume', ['val']=80}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)


    if (err) then 
        AFB:error("--LUA:Audio_Set_System halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Communication mode
function _Audio_Set_Warning (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- Warning control increase volume on open
    ctlhal={['label']='Warning_Playback_Volume', ['val']=100}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    -- Set all other stream at zero
    ctlhal={['label']='Entertainment_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)
    
    ctlhal={['label']='Guidance_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='Notification_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='Communication_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='System_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)


    if (err) then 
        AFB:error("--LUA:Audio_Set_Warning halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Mute mode
function _Audio_Set_Mute (source, args, query)

    -- in strict mode every variables should be declared
    local err=0
    local ctlhal={}
    local response={}
    local apihal={}

    AFB:notice ("LUA:Audio_Set_Use_Case source=%d args=%s query=%s", source, args, query);
   
    -- Parse Query/Args and if HAL not found then refuse access
    apihal= Audio_Parse_Request (source, args, query)
    if (apihal == nil) then return 1 end


    -- Warning control increase volume on open
    ctlhal={['label']='Warning_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    -- Set all other stream at zero
    ctlhal={['label']='Entertainment_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)
    
    ctlhal={['label']='Guidance_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='Notification_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='Communication_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)

    ctlhal={['label']='System_Playback_Volume', ['val']=0}
    err, response= AFB:servsync (apihal, 'ctlset',ctlhal)



    if (err) then 
        AFB:error("--LUA:Audio_Set_Mute halapi=%s refuse ctl=%s", apihal, ctlhal)
        return 1 -- control refused
    end


    return 0 -- control accepted
end

-- Select Emergency Mode
function _Audio_Set_Emergency(source, args, query)
    return 1 -- Always refuse in this test
end


--Stub section only 
function _Audio_Set_Volume(source, args, query)
    return 0 -- Always accept
end
-- Select Emergency Mode
function _Audio_Set_Events(source, args, query)
    return 0 -- Always accept
end
-- Select Emergency Mode
function _Audio_Set_Property(source, args, query)
    return 0 -- Always accept
end
-- Select Emergency Mode
function _Audio_Set_State(source, args, query)
    return 0 -- Always accept
end