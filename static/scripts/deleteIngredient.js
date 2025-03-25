document.addEventListener("DOMContentLoaded", function () {
    const foodInput = document.getElementById("foodInput");
    const quantityInput = document.getElementById("quantityInput");
    const increaseBtn = document.getElementById("increaseBtn");
    const decreaseBtn = document.getElementById("decreaseBtn");
    const addFoodBtn = document.getElementById("addFoodBtn");
    const foodTable = document.getElementById("foodTable").querySelector("tbody");
    let counter = 0;

    // Increase Quantity
    increaseBtn.addEventListener("click", function () {
      quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    // Decrease Quantity
    decreaseBtn.addEventListener("click", function () {
      if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
      }
    });

    addFoodBtn.addEventListener("click", function () {
      const food = foodInput.value.trim();
      const quantity = quantityInput.value.trim();

      if (!food) {
        alert("Please enter a valid food item.");
        return;
      }

      counter++;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${counter}</td>
        <td contenteditable="false" class="food-name">${food}</td>
        <td contenteditable="false" class="food-quantity">${quantity}</td>
        <td>
          <button class="btn btn-warning btn-sm edit-btn">Edit</button>
          <button class="btn btn-success btn-sm save-btn d-none">Save</button>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </td>
      `;

      row.querySelector(".delete-btn").addEventListener("click", function () {
        row.remove();
        updateRowNumbers();
      });

      const editBtn = row.querySelector(".edit-btn");
      const saveBtn = row.querySelector(".save-btn");

      editBtn.addEventListener("click", function () {
        row.querySelector(".food-name").contentEditable = "true";
        row.querySelector(".food-quantity").contentEditable = "true";
        editBtn.classList.add("d-none");
        saveBtn.classList.remove("d-none");
      });

      saveBtn.addEventListener("click", function () {
        row.querySelector(".food-name").contentEditable = "false";
        row.querySelector(".food-quantity").contentEditable = "false";
        editBtn.classList.remove("d-none");
        saveBtn.classList.add("d-none");
      });

      foodTable.appendChild(row);
      foodInput.value = "";
      quantityInput.value = "1";
    });

    function updateRowNumbers() {
      counter = 0;
      foodTable.querySelectorAll("tr").forEach((row) => {
        row.children[0].textContent = ++counter;
      });
    }
  });