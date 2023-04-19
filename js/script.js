$(function () {
  $("#navbarToggle").blur(function (event) {
    let screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse("hide");
    }
  });
});

(function (global) {
  let dc = {};
  let homeHtmlUrl = "snippets/home-snippet.html";
  let allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
  let categoriesTitleHtml = "snippets/categories-title-snippet.html";
  let categoryHtml = "snippets/category-snippet.html";
  let menuItemsUrl =
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
  let menuItemsTitleHtml = "snippets/menu-items-title.html";
  let menuItemHtml = "snippets/menu-item.html";

  let insertHtml = function (selector, html) {
    let targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  let showLoading = function (selector) {
    let html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  let insertProperty = function (string, propName, propValue) {
    let propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  let switchMenuToActive = function () {
    let classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
      classes += " active";
      document.querySelector("#navMenuButton").className = classes;
    }
  };
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowHomeHTML, true);
  });

  function buildAndShowHomeHTML(categories) {
    $ajaxUtils.sendGetRequest(
      homeHtmlUrl,
      function (homeHtml) {
        let chosenCategoryShortName =
          chooseRandomCategory(categories).short_name;
        chosenCategoryShortName = "'" + chosenCategoryShortName + "'";
        let homeHtmlToInsertIntoMainPage = insertProperty(
          homeHtml,
          "randomCategoryShortName",
          chosenCategoryShortName
        );
        insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
      },
      false
    );
  }

  function chooseRandomCategory(categories) {
    let randomArrayIndex = Math.floor(Math.random() * categories.length);
    return categories[randomArrayIndex];
  }

  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
  };

  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort,
      buildAndShowMenuItemsHTML
    );
  };

  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(
      categoriesTitleHtml,
      function (categoriesTitleHtml) {
        $ajaxUtils.sendGetRequest(
          categoryHtml,
          function (categoryHtml) {
            switchMenuToActive();
            let categoriesViewHtml = buildCategoriesViewHtml(
              categories,
              categoriesTitleHtml,
              categoryHtml
            );
            insertHtml("#main-content", categoriesViewHtml);
          },
          false
        );
      },
      false
    );
  }

  function buildCategoriesViewHtml(
    categories,
    categoriesTitleHtml,
    categoryHtml
  ) {
    let finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    for (let i = 0; i < categories.length; i++) {
      let html = categoryHtml;
      let name = "" + categories[i].name;
      let short_name = categories[i].short_name;
      html = insertProperty(html, "name", name);
      html = insertProperty(html, "short_name", short_name);
      finalHtml += html;
    }
    finalHtml += "</section>";
    return finalHtml;
  }

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(
      menuItemsTitleHtml,
      function (menuItemsTitleHtml) {
        $ajaxUtils.sendGetRequest(
          menuItemHtml,
          function (menuItemHtml) {
            switchMenuToActive();
            let menuItemsViewHtml = buildMenuItemsViewHtml(
              categoryMenuItems,
              menuItemsTitleHtml,
              menuItemHtml
            );
            insertHtml("#main-content", menuItemsViewHtml);
          },
          false
        );
      },
      false
    );
  }

  function buildMenuItemsViewHtml(
    categoryMenuItems,
    menuItemsTitleHtml,
    menuItemHtml
  ) {
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "name",
      categoryMenuItems.category.name
    );
    menuItemsTitleHtml = insertProperty(
      menuItemsTitleHtml,
      "special_instructions",
      categoryMenuItems.category.special_instructions
    );
    let finalHtml = menuItemsTitleHtml;
    finalHtml += "<section class='row'>";
    let menuItems = categoryMenuItems.menu_items;
    let catShortName = categoryMenuItems.category.short_name;
    for (let i = 0; i < menuItems.length; i++) {
      let html = menuItemHtml;
      html = insertProperty(html, "short_name", menuItems[i].short_name);
      html = insertProperty(html, "catShortName", catShortName);
      html = insertItemPrice(html, "price_small", menuItems[i].price_small);
      html = insertItemPortionName(
        html,
        "small_portion_name",
        menuItems[i].small_portion_name
      );
      html = insertItemPrice(html, "price_large", menuItems[i].price_large);
      html = insertItemPortionName(
        html,
        "large_portion_name",
        menuItems[i].large_portion_name
      );
      html = insertProperty(html, "name", menuItems[i].name);
      html = insertProperty(html, "description", menuItems[i].description);
      if (i % 2 !== 0) {
        html +=
          "<div class='clearfix visible-lg-block visible-md-block'></div>";
      }
      finalHtml += html;
    }
    finalHtml += "</section>";
    return finalHtml;
  }

  function insertItemPrice(html, pricePropName, priceValue) {
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }
    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
  }

  function insertItemPortionName(html, portionPropName, portionValue) {
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }
    portionValue = "(" + portionValue + ")";
    html = insertProperty(html, portionPropName, portionValue);
    return html;
  }
  global.$dc = dc;
})(window);
