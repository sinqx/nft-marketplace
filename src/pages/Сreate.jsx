import { useState } from 'react';
import {setGlobalState, setLoadingMsg, setAlert } from '../store';
import { create } from 'ipfs-http-client';
import { mintNFT } from '../Blockchain.Services';
import React from "react";
import { Container, Row, Col } from "reactstrap";
import CommonSection from "../components/ui/Common-section/CommonSection";
import NftCard from "../components/ui/Nft-card/NftCard";
import defaultAvatar from "../assets/images/ava-01.png";
import { Buffer } from "buffer";


const CreateNFT = () => {
    const [_title, _setTitle] = useState('');
    const [_price, setPrice] = useState('');
    const [_description, _setDescription] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [imgBase64, setImgBase64] = useState(null);

    const auth = 'Basic ' + Buffer.from(
        '2Pn8jQb4ZFraXRSVqSJUpDmqS7s' + ':' + 'ff2706b3bcd65de4c765886a1159d094',
    ).toString('base64')


    const client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!_title || !_price || !_description || !fileUrl) return;

        setGlobalState('modal', 'scale-0');
        setGlobalState('loading', { show: true, msg: 'Uploading IPFS data...' });

        try {
            const created = await client.add(fileUrl);
           
            const metadataURI = `https://ipfs.io/ipfs/${created.path}`
            console.log(metadataURI)
            console.log(created)
            console.log(fileUrl)
            
            const nft = { _imageHash: fileUrl, _title, _description, _salesPrice: _price };
         
            setLoadingMsg('Intializing transaction...');
            setFileUrl(metadataURI);
            console.log(nft)
            await mintNFT(nft);

            resetForm();
            setAlert('Minting completed...', 'green');
            //     window.location.reload();
        
        } catch (error) {
            console.log('Error uploading file: ', error);
            setAlert('Minting failed...', 'red');
        }
    };


    const changeImage = async (e) => {
        const reader = new FileReader()
        if (e.target.files[0]) reader.readAsDataURL(e.target.files[0])

        reader.onload = (readerEvent) => {
            const file = readerEvent.target.result
            setImgBase64(file)
            setFileUrl(e.target.files[0])
            console.log(e.target.files[0])
        }
    }

    const resetForm = () => {
        _setTitle('');
        setPrice('');
        _setDescription('');
        setImgBase64(null);
        setFileUrl('');
    };

    return (
        <>
            <CommonSection _title="Создать картину" />
            <section>
                <Container>
                    <Row>
                        <Col lg="3" md="4" sm="6">
                            <h5 className="mb-4 text-light">Предпросмотр</h5>
                            <NftCard item={{ imgUrl: imgBase64, _title: _title, creatorImg: defaultAvatar, currentBid: _price }} />
                        </Col>

                        <Col lg="9" md="8" sm="6">
                            <div className="create__item">
                                <form onSubmit={handleSubmit}>
                                    <div className="form__input">
                                        <label htmlFor="">Загрузить файл</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/gif, image/jpeg, image/webp"
                                            required
                                            name="file"
                                            className="upload__input"
                                            onChange={(e) => changeImage(e)}
                                        />
                                    </div>

                                    <div className="form__input">
                                        <label htmlFor="">Цена</label>
                                        <input
                                            type="number"
                                            name="price"
                                            step={0.0000001}
                                            min={0.00000001}
                                            placeholder="Цена (Eth)"
                                            value={_price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form__input">
                                        <label htmlFor="">Название</label>
                                        <input
                                            type="text"
                                            name="_title"
                                            placeholder="_Title"
                                            value={_title}
                                            onChange={(e) => _setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form__input">
                                        <label htmlFor="">
                                            Описание <span>*</span>
                                        </label>
                                        <textarea
                                            id=""
                                            rows="7"
                                            type="text"
                                            name="_description"
                                            placeholder="_Description"
                                            value={_description}
                                            onChange={(e) => _setDescription(e.target.value)}
                                            required
                                            className="w-100"
                                        ></textarea>
                                    </div>

                                    <button type="submit"
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

export default CreateNFT;