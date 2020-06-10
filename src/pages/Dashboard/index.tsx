import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const newFood: IFoodPlate = {
        id: foods[foods.length - 1] ? foods[foods.length -1].id + 1 : 1,
        available: true,
        ...food
      }
      await api.post('/foods', newFood);
      setFoods(prevState => [...prevState, newFood]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {

    const updateFood: IFoodPlate = {
      id: editingFood.id,
      available: editingFood.available,
      ...food
    }

    const updatedList = foods.map((food) => (
       food.id === updateFood.id ?  updateFood : food
    ))

    await api.put(`/foods/${editingFood.id}`, updateFood);
    setFoods(updatedList);

  }


  async function handleDeleteFood(id: number): Promise<void> {
    await api.delete(`/foods/${id}`)
    const newFoodList = foods.filter((food) => food.id !== id);
    setFoods(newFoodList);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
