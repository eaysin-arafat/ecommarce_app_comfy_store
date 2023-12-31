import { createSlice } from "@reduxjs/toolkit";
import { allProducts, singleProduct } from "./productApiSlice";

const initialState = {
  isSidebarOpen: false,
  products_loading: false,
  products_error: false,
  products: [],
  featured_products: [],
  single_product_loading: false,
  single_product_error: false,
  single_product: {},

  // filter state
  filtered_products: [],
  grid_view: true,
  sort: "name-a",
  filters: {
    text: "",
    company: "all",
    category: "all",
    color: "all",
    min_price: 0,
    max_price: 0,
    price: 0,
    shipping: false,
  },
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = true;
    },
    setSidebarClose: (state, action) => {
      state.isSidebarOpen = false;
    },
    setGridView: (state, action) => {
      state.grid_view = true;
    },
    setListView: (state, action) => {
      state.grid_view = false;
    },
    setUpdateSort: (state, action) => {
      state.sort = action.payload;
    },
    setSortProduct: (state, action) => {
      const { sort, filtered_products } = state;

      let tempProducts = [...filtered_products];

      if (sort === "price-lowest") {
        tempProducts = tempProducts.sort((a, b) => a.price - b.price);
      }
      if (sort === "price-highest") {
        tempProducts = tempProducts.sort((a, b) => b.price - a.price);
      }
      if (sort === "name-a") {
        tempProducts = tempProducts.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      }
      if (sort === "name-z") {
        tempProducts = tempProducts.sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      }

      return { ...state, filtered_products: tempProducts };
    },
    setUpdateFilter: (state, action) => {
      const { name, value } = action.payload;
      const { filters } = state;
      return { ...state, filters: { ...filters, [name]: value } };
    },
    setFilterProduct: (state, action) => {
      const { products } = state;
      const { text, category, company, color, price, shipping } = state.filters;
      let tempProducts = [...products];

      // filtering
      // text
      if (text) {
        tempProducts = tempProducts.filter((product) =>
          product.name.toLowerCase().startsWith(text)
        );
      }
      // category
      if (category !== "all") {
        tempProducts = tempProducts.filter(
          (product) => product.category === category
        );
      }
      // company
      if (company !== "all") {
        tempProducts = tempProducts.filter(
          (product) => product.company === company
        );
      }
      // colors
      if (color !== "all") {
        tempProducts = tempProducts.filter((product) =>
          product.colors.find((c) => c === color)
        );
      }
      // price
      tempProducts = tempProducts.filter((product) => product.price <= price);
      // shipping
      if (shipping) {
        tempProducts = tempProducts.filter(
          (product) => product.shipping === true
        );
      }

      return { ...state, filtered_products: tempProducts };
    },
    clearFilter: (state, action) => {
      const { filters } = state;
      return {
        ...state,
        filters: {
          ...filters,
          text: "",
          company: "all",
          category: "all",
          color: "all",
          price: state.filters.max_price,
          shipping: false,
        },
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(allProducts.pending, (state, action) => {
        state.products_loading = true;
      })
      .addCase(allProducts.fulfilled, (state, action) => {
        const featured = action.payload.filter(
          (product) => product.featured === true
        );
        let maxPrice = action.payload.map((p) => p.price);
        maxPrice = Math.max(...maxPrice);

        state.products_loading = false;
        state.featured_products = featured;
        state.products = action.payload;
        state.filtered_products = action.payload;
        state.filters.max_price = maxPrice;
        state.filters.price = maxPrice;
      })
      .addCase(allProducts.rejected, (state, action) => {
        state.products_loading = false;
        state.products_error = action.error.message;
      });
    builder
      .addCase(singleProduct.pending, (state, action) => {
        state.single_product_loading = true;
      })
      .addCase(singleProduct.fulfilled, (state, action) => {
        state.single_product_loading = false;
        state.single_product = action.payload[0];
      })
      .addCase(singleProduct.rejected, (state, action) => {
        state.single_product_loading = false;
        state.single_product_error = action.error.message;
      });
  },
});

export const {
  setSidebarOpen,
  setSidebarClose,
  setGridView,
  setListView,
  setUpdateSort,
  setSortProduct,
  setUpdateFilter,
  setFilterProduct,
  clearFilter,
} = productSlice.actions;
export default productSlice.reducer;
