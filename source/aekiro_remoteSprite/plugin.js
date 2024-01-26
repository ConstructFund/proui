"use strict";
{
	const SDK = self.SDK;
	const lang = self.lang;
    const PLUGIN_ID = "aekiro_remoteSprite";
    const PLUGIN_VERSION = "1.817";
    const PLUGIN_CATEGORY = "general";

    let app = null;

    const PLUGIN_CLASS = SDK.Plugins.aekiro_remoteSprite = class RemoteSpriteIPlugin extends SDK.IPluginBase
    {
        constructor()
        {
            super(PLUGIN_ID);

            SDK.Lang.PushContext("plugins." + PLUGIN_ID.toLowerCase());

            this._info.SetName(lang(".name"));
            this._info.SetDescription(lang(".description"));
            this._info.SetVersion(PLUGIN_VERSION);
            this._info.SetCategory(PLUGIN_CATEGORY);
            this._info.SetAuthor("Aekiro");
            this._info.SetHelpUrl(lang(".help-url"));
            this._info.SetPluginType("world"); // mark as world plugin, which can draw
            this._info.SetIsResizable(true); // allow to be resized
            this._info.SetIsRotatable(true); // allow to be rotated
            this._info.SetHasImage(true);
            this._info.SetSupportsEffects(true); // allow effects
            this._info.SetMustPreDraw(true);
            this._info.AddCommonPositionACEs();
            this._info.AddCommonAngleACEs();
            this._info.AddCommonAppearanceACEs();
            this._info.AddCommonZOrderACEs();
            this._info.SetIsTiled(false);
            this._info.SetIsSingleGlobal(false);
            this._info.SetIsDeprecated(false);
            this._info.SetCanBeBundled(true); 
            

            this._info.SetSupportedRuntimes(["c3"]);

            SDK.Lang.PushContext(".properties");

            this._info.SetProperties([
                new SDK.PluginProperty("integer", "resolution", 4),
                new SDK.PluginProperty("color", "color", [0, 0.63, 0.9])
                
            ]);
            SDK.Lang.PopContext(); //.properties
            SDK.Lang.PopContext();
        }
    };

    PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
}