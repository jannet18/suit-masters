"use client";
import React from "react";
import { OptionChangeHandler, SelectedOptions, Step } from "../lib/types";
import {
  buttonOptions,
  fabricOpts,
  lapelOptions,
  liningOptions,
  pocketOptions,
  styleOptions,
  ventOptions,
} from "../lib/optionsData";

interface Props {
  step: Step;
  selectedOptions: SelectedOptions;
  onOptionChange: OptionChangeHandler;
}

const CustomizationOptions: React.FC<Props> = ({
  step,
  selectedOptions,
  onOptionChange,
}) => {
  const renderOptions = () => {
    switch (step.id) {
      case "fabric":
        return (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Select Your Fabric
            </h2>
            <p className="text-gray-600 mb-8">
              Choose from our premium selection of fabrics, ranging from classic
              wool to luxurious cashmere blends.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fabricOpts.map((fabric) => (
                <div
                  key={fabric.id}
                  onClick={() => onOptionChange("fabric", fabric)}
                  className={`cursor-pointer border rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedOptions.fabric?.id === fabric.id
                      ? "border-amber-600 shadow-lg transform scale-[1.02]"
                      : "border-gray-200 hover:border-amber-400"
                  }`}
                >
                  <div
                    className="h-32 w-full"
                    style={{
                      backgroundColor: fabric.color,
                      backgroundImage: fabric.pattern
                        ? `url(${fabric.pattern})`
                        : "none",
                      backgroundSize: "50px 50px",
                      backgroundRepeat: "repeat",
                    }}
                  ></div>
                  <div className="p-3 bg-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{fabric.name}</h3>
                      {fabric.premium && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                    {fabric.premium && (fabric.priceModifier ?? 0) > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        +${fabric.priceModifier ?? 0}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "style":
        return (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Choose Your Style
            </h2>
            <p className="text-gray-600 mb-8">
              Select the style that best represents your personal aesthetic and
              occasion needs.
            </p>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Jacket Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {styleOptions.map((style) => (
                    <div
                      key={style.id}
                      onClick={() => onOptionChange("style", style.id)}
                      className={`cursor-pointer p-4 border rounded-lg transition-all duration-300 ${
                        selectedOptions.style === style.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            selectedOptions.style === style.id
                              ? "border-amber-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOptions.style === style.id && (
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          )}
                        </div>
                        <span>{style.name}</span>
                      </div>
                      {style.id === "double-breasted" && (
                        <p className="text-sm text-gray-500 mt-1 ml-9">+$50</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Lapel Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {lapelOptions.map((lapel) => (
                    <div
                      key={lapel.id}
                      onClick={() => onOptionChange("lapel", lapel.id)}
                      className={`cursor-pointer p-4 border rounded-lg transition-all duration-300 ${
                        selectedOptions.lapel === lapel.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            selectedOptions.lapel === lapel.id
                              ? "border-amber-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOptions.lapel === lapel.id && (
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          )}
                        </div>
                        <span>{lapel.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Buttons</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {buttonOptions.map((button) => (
                    <div
                      key={button.id}
                      onClick={() => onOptionChange("buttons", button.id)}
                      className={`cursor-pointer p-4 border rounded-lg transition-all duration-300 ${
                        selectedOptions.buttons === button.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            selectedOptions.buttons === button.id
                              ? "border-amber-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOptions.buttons === button.id && (
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          )}
                        </div>
                        <span>{button.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "details":
        return (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Customize Details
            </h2>
            <p className="text-gray-600 mb-8">
              Fine-tune the details of your suit to create a truly personalized
              garment.
            </p>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Jacket Vents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ventOptions.map((vent) => (
                    <div
                      key={vent.id}
                      onClick={() => onOptionChange("vents", vent.id)}
                      className={`cursor-pointer p-4 border rounded-lg transition-all duration-300 ${
                        selectedOptions.vents === vent.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            selectedOptions.vents === vent.id
                              ? "border-amber-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOptions.vents === vent.id && (
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          )}
                        </div>
                        <span>{vent.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Pocket Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pocketOptions.map((pocket) => (
                    <div
                      key={pocket.id}
                      onClick={() => onOptionChange("pockets", pocket.id)}
                      className={`cursor-pointer p-4 border rounded-lg transition-all duration-300 ${
                        selectedOptions.pockets === pocket.id
                          ? "border-amber-600 bg-amber-50"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                            selectedOptions.pockets === pocket.id
                              ? "border-amber-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedOptions.pockets === pocket.id && (
                            <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                          )}
                        </div>
                        <span>{pocket.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Lining Color</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {liningOptions.map((lining) => (
                    <div
                      key={lining.id}
                      onClick={() => onOptionChange("lining", lining.id)}
                      className={`cursor-pointer border rounded-lg overflow-hidden transition-all duration-300 ${
                        selectedOptions.lining === lining.id
                          ? "border-amber-600 shadow-md"
                          : "border-gray-200 hover:border-amber-400"
                      }`}
                    >
                      <div
                        className="h-16 w-full"
                        style={{
                          backgroundColor: lining.color || "#f0f0f0",
                        }}
                      ></div>
                      <div className="p-2 text-center">
                        <span className="text-sm">{lining.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Monogram (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Add your initials or a short personal message (up to 10
                  characters)
                </p>
                <input
                  type="text"
                  maxLength={10}
                  value={selectedOptions.monogram}
                  onChange={(e) => onOptionChange("monogram", e.target.value)}
                  placeholder="e.g., JBD"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
          </div>
        );
      case "measurements":
        return (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Your Measurements
            </h2>
            <p className="text-gray-600 mb-8">
              Provide your measurements for the perfect fit, or select from our
              standard sizes.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Standard Sizes</h3>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="standard-sizes"
                    name="measurement-type"
                    className="h-4 w-4 text-amber-600"
                    defaultChecked
                  />
                  <label htmlFor="standard-sizes" className="ml-2">
                    Use standard sizes
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Jacket Size
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option value="">Select size</option>
                    <option value="36">36 Regular</option>
                    <option value="38">38 Regular</option>
                    <option value="40">40 Regular</option>
                    <option value="42">42 Regular</option>
                    <option value="44">44 Regular</option>
                    <option value="46">46 Regular</option>
                    <option value="36S">36 Short</option>
                    <option value="38S">38 Short</option>
                    <option value="40S">40 Short</option>
                    <option value="42S">42 Short</option>
                    <option value="36L">36 Long</option>
                    <option value="38L">38 Long</option>
                    <option value="40L">40 Long</option>
                    <option value="42L">42 Long</option>
                    <option value="44L">44 Long</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Trouser Size
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-600">
                    <option value="">Select size</option>
                    <option value="28">28</option>
                    <option value="30">30</option>
                    <option value="32">32</option>
                    <option value="34">34</option>
                    <option value="36">36</option>
                    <option value="38">38</option>
                    <option value="40">40</option>
                    <option value="42">42</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium">Custom Measurements</h3>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom-measurements"
                    name="measurement-type"
                    className="h-4 w-4 text-amber-600"
                  />
                  <label htmlFor="custom-measurements" className="ml-2">
                    Use custom measurements
                  </label>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                For the most accurate fit, we recommend having a professional
                tailor take your measurements. Alternatively, follow our
                measurement guide to take your own measurements at home.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Chest",
                  "Waist",
                  "Hips",
                  "Shoulder Width",
                  "Sleeve Length",
                  "Back Length",
                ].map((measurement) => (
                  <div key={measurement}>
                    <label className="block text-gray-700 mb-2">
                      {measurement}
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        placeholder="0"
                        disabled
                        className="w-full p-3 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none"
                      />
                      <span className="inline-flex items-center px-3 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md text-gray-500">
                        in
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="mt-6 text-amber-600 font-medium flex items-center"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  />
                </svg>
                Add More Measurements
              </button>
            </div>
          </div>
        );
      case "review":
        return (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">
              Review Your Custom Suit
            </h2>
            <p className="text-gray-600 mb-8">
              Review all the details of your custom suit before adding it to
              your cart.
            </p>
            <div className="space-y-8">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Fabric & Style</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fabric</p>
                    <p className="font-medium">
                      {selectedOptions.fabric?.name || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Style</p>
                    <p className="font-medium">
                      {selectedOptions.style || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lapel</p>
                    <p className="font-medium">
                      {selectedOptions.lapel || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Buttons</p>
                    <p className="font-medium">
                      {selectedOptions.buttons || "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Vents</p>
                    <p className="font-medium">
                      {selectedOptions.vents || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pockets</p>
                    <p className="font-medium">
                      {selectedOptions.pockets || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lining</p>
                    <p className="font-medium">
                      {selectedOptions.lining || "Not selected"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monogram</p>
                    <p className="font-medium">
                      {selectedOptions.monogram || "None"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Sizing</h3>
                <div>
                  <p className="text-sm text-gray-500">Method</p>
                  <p className="font-medium">Standard Sizing</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Jacket Size</p>
                    <p className="font-medium">40 Regular</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Trouser Size</p>
                    <p className="font-medium">34</p>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-amber-800 mb-2">
                  Production & Delivery
                </h3>
                <p className="text-amber-700">
                  Your custom suit will be crafted by our expert tailors and
                  delivered within 3-4 weeks.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return <div className="bg-white rounded-lg">{renderOptions()}</div>;
};

export default CustomizationOptions;
