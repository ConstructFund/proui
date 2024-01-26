"use strict";
{
    const DOM_COMPONENT_ID = "aekiro_remoteSprite_dom";

    C3.Plugins.aekiro_remoteSprite = class RemoteSpritePlugin extends C3.SDKDOMPluginBase
    {
        constructor(opts)
        {
            super(opts, DOM_COMPONENT_ID);
        }

        Release()
        {
            super.Release();
        }
    };
}