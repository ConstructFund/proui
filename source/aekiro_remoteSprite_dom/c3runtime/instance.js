"use strict";
{
   
    const DOM_COMPONENT_ID = "aekiro_remoteSprite_dom";

    C3.Plugins.aekiro_remoteSprite.Instance = class RemoteSpriteInstance extends C3.SDKDOMInstanceBase
    {
        constructor(inst, properties)
        {
            super(inst, DOM_COMPONENT_ID);
        }

        Release()
        {
            super.Release();
        }

        Draw(renderer)
        {

        }


        
        SaveToJson()
        {
            return {
                // data to be saved for savegames
            };
        }

        LoadFromJson(o)
        {
            // load state for savegames
        }

        GetDebuggerProperties()
        {
            return [
            {
            }];
        }
    };
}