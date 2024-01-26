//Converted with C2C3AddonConverter v1.0.1.1
"use strict";

{
	const SDK = self.SDK;
	const lang = self.lang;
	const BEHAVIOR_ID = "aekiro_checkbox";
	const BEHAVIOR_VERSION = "1.817";
	const BEHAVIOR_CATEGORY = "other";
	const BEHAVIOR_CLASS = SDK.Behaviors.aekiro_checkbox = class aekiro_checkbox extends SDK.IBehaviorBase
	{
		constructor()
		{
			super(BEHAVIOR_ID);
			SDK.Lang.PushContext("behaviors." + BEHAVIOR_ID.toLowerCase());
			this._info.SetName(lang(".name"));
			this._info.SetDescription(lang(".description"));
			this._info.SetVersion(BEHAVIOR_VERSION);
			this._info.SetCategory(BEHAVIOR_CATEGORY);
			this._info.SetAuthor("Aekiro");
			this._info.SetHelpUrl(lang(".help-url"));
			this._info.SetIsOnlyOneAllowed(true);

			this._info.SetSupportedRuntimes(["c3"]);	// c3 for stubs only!

			SDK.Lang.PushContext(".properties");
			this._info.SetProperties([
				new SDK.PluginProperty("combo", "isenabled", {initialValue:"true", items:["false","true"]}),
				new SDK.PluginProperty("combo", "ischecked", {initialValue:"true", items:["false","true"]}),
				new SDK.PluginProperty("text", "normal-frames", ""),
				new SDK.PluginProperty("text", "hover-frames", ""),
				new SDK.PluginProperty("text", "disabled-frames", ""),
				new SDK.PluginProperty("text", "focus-frame", ""),
				new SDK.PluginProperty("text", "click-sound", ""),
				new SDK.PluginProperty("text", "hover-sound", ""),
				new SDK.PluginProperty("text", "focus-sound", ""),
				new SDK.PluginProperty("combo", "click-animation", {initialValue:"none", items:["none","scale quadratic","scale elastic","down","up","left","right"]}),
				new SDK.PluginProperty("combo", "hover-animation", {initialValue:"none", items:["none","scale quadratic","scale elastic","down","up","left","right"]}),
				new SDK.PluginProperty("combo", "focus-animation", {initialValue:"none", items:["none","scale quadratic","scale elastic","down","up","left","right"]}),
				new SDK.PluginProperty("text", "normal-color", ""),
				new SDK.PluginProperty("text", "hover-color", ""),
				new SDK.PluginProperty("text", "clicked-color", ""),
				new SDK.PluginProperty("text", "disabled-color", ""),
				new SDK.PluginProperty("text", "focus-color", ""),

				new SDK.PluginProperty("float", "click-animation-factor", 0.1),
				new SDK.PluginProperty("float", "hover-animation-factor", 0.1),
				new SDK.PluginProperty("float", "focus-animation-factor", 0.1),
				
				new SDK.PluginProperty("combo", "ignore-input", {initialValue:"auto", items:["no","yes","auto"]})
			]);
			SDK.Lang.PopContext();		// .properties
			SDK.Lang.PopContext();
		}
	};
	BEHAVIOR_CLASS.Register(BEHAVIOR_ID, BEHAVIOR_CLASS);
}
