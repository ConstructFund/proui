"use strict";
{
    const PLUGIN_CLASS = SDK.Plugins.aekiro_remoteSprite;

    PLUGIN_CLASS.Type = class RemoteSpriteIType extends SDK.ITypeBase
    {
        constructor(sdkPlugin, iObjectType)
        {
            super(sdkPlugin, iObjectType);
        }
    };
}