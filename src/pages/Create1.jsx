import React from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import img from "../assets/images/img-01.jpg";
import avatar from "../assets/images/ava-01.png";

import "../styles/create-item.css";

const item = {
  id: "01",
  title: "Guard",
  desc: "Test, nostr.",
  imgUrl: img,
  creator: "Атызаков Даниил",
  creatorImg: img,
  currentBid: 7.89,
};

const Create = () => {
 
  return (
    <>
      <CommonSection title="Создать картину" />
      <section>
        <Container>
          <Row>
            <Col lg="3" md="4" sm="6">
              <h5 className="mb-4 text-light">Предпросмотр</h5>
              <NftCard item={item} />
            </Col>

            <Col lg="9" md="8" sm="6">
              <div className="create__item">
                <form>
                  <div className="form__input">
                    <label htmlFor="">Загрузить файл</label>
                    <input type="file"
                      accept="image/png, image/gif, image/jpeg, image/webp"
                
                      required 
                      className="upload__input" />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Цена</label>
                    <input   type="number"
                      name="price"
                      step={0.01}
                      min={0.01}
                      placeholder="Цена (Eth)"
                   
                     value={price}
                      required />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Название</label>
                      <input type="text"
                        name="name"
                        placeholder="Title"
                    
                       value={name}
                        required
                      />
                  </div>

                  <div className="form__input">
                    <label htmlFor="">Описание</label> <span>*</span>
                    <textarea
                      id=""
                      rows="7"
                      ype="text"
                      name="description"
                      placeholder="Description"
                  
                     value={description}
                      required
                      className="w-100"
                    ></textarea>
                  </div>

                  <button
                  type="submit"
                  className="flex flex-row justify-center items-center
                    w-full text-white text-md bg-[#25bd9c]
                    py-2 px-5 rounded-full
                    drop-shadow-xl border border-transparent
                    hover:bg-transparent hover:text-[#ffffff]
                    hover:border hover:border-[#25bd9c]
                    focus:outline-none focus:ring mt-5"
                  >
                  Mint Now
                </button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Create;
