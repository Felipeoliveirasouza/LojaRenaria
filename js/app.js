$(document).ready(function() {
    produtos.eventos.init();
});

var produtos = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
// var VALOR_ENTREGA = 0;

var CELULAR_EMPRESA = '5585996239268';

produtos.eventos = {

    init: () => {
        produtos.metodos.obterItensProdutos();
        produtos.metodos.carregarBotaoLigar();
        produtos.metodos.carregarBotaoWhats();
        produtos.metodos.carregarBotaoWhatsFooter();
    }

}

produtos.metodos = {

    // obtem os itens dos produtos
    obterItensProdutos: (categoria = 'lingeries', vermais = false) => {

        var filtro = MENU[categoria];
        console.log(filtro);

        if (!vermais) {
            $("#itens-produtos").html("");
            $("#btnVerMais").removeClass("hidden");
        }

        

        $.each(filtro, (i, e) => {

            let temp = produtos.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${name}/g, e.name)
            .replace(/\${dsc}/g, e.dsc)
            .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id)

            // botão ver mais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itens-produtos").append(temp)
            }

            // paginação padrão (8 itens)
            if (!vermais && i < 8) {
                $("#itens-produtos").append(temp)
            }

        })

        // remove a classe active de todos os itens
        $(".container-menu a").removeClass("active");

        // adiciona a classe active ao item selecionado
        $("#menu-" + categoria).addClass("active");

    },

    // cliquei no botão ver mais
    verMais: (categoria) => {
        var ativo = $(".container-menu a.active").attr("id").split('menu-')[1];
        produtos.metodos.obterItensProdutos(ativo, true);

        $("#btnVerMais").addClass("hidden");
    },

    // diminui a quantidade de itens
    diminuirQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1);
        }

    },
    // aumenta a quantidade de itens
    aumentarQuantidade: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());
        $("#qntd-" + id).text(qntdAtual + 1);

    },

    // adiciona o item ao carrinho
    adicionarAoCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-" + id).text());

        if (qntdAtual > 0) {
           
            // obter categoria ativa
            var categoria = $(".container-menu a.active").attr("id").split('menu-')[1];

            // obtem a lista de itens
            let filtro = MENU[categoria];

            // obtem o item clicado
            let item = $.grep(filtro, (e, i) => { return e.id == id });

            if (item.length > 0) {

                // verifica se o item já existe no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => { return elem.id == id });

                // se o item já existe no carrinho, atualiza a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;

                }
                // se o item não existe no carrinho, adiciona
                else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]);
                }

                produtos.metodos.mensagem("Item adicionado ao carrinho", 'green',);
                $("#qntd-" + id).text(0);
                produtos.metodos.atualizarBadgeTotal();

            }

        }

    },

    // Atualiza o badge do carrinho
    atualizarBadgeTotal: () => {

        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        }
        else {
            $(".botao-carrinho").addClass('hidden')
            $(".container-total-carrinho").addClass('hidden');
        }

        $(".badge-total-carrinho").html(total);

    },

    // abrir a modal do carrinho
    abrirCarrinho: (abrir) => {

        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            produtos.metodos.carregarCarrinho();
        }
        else{
            $("#modalCarrinho").addClass('hidden');
        }

    },

    //altera os textos e exibe os botões das etapas do carrinho
    carregarEtapas: (etapa) => {

        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
        
        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

    },

    // botão de voltar etapa
    voltarEtapa: () => {

        let etapa = $(".etapa.active").length;

        produtos.metodos.carregarEtapas(etapa - 1);

    },

    // carregar os itens do carrinho
    carregarCarrinho: () => {

        produtos.metodos.carregarEtapas(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html("");

            $.each(MEU_CARRINHO, (i, e) => {

                let temp = produtos.templates.itemCarrinho.replace(/\${img}/g, e.img)
                    .replace(/\${name}/g, e.name)
                    .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                    .replace(/\${id}/g, e.id)
                    .replace(/\${qntd}/g, e.qntd)

                $("#itensCarrinho").append(temp);

                //último item do carrinho
                if (i + 1 == MEU_CARRINHO.length) {
                    produtos.metodos.carregarValores();
                }   

            })

        }
        else {

            $("#itensCarrinho").html('<p class="carrinho-vazior"><i class="fa fa-shopping-bag"></i>Seu carrinho está vazio</p>');
            produtos.metodos.carregarValores();

        }

    },

    // diminuir a quantidade do item no carrinho
    diminuirQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

        if (qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            produtos.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
            produtos.metodos.removerItemCarrinho(id);
        }


    },

    aumentarQuantidadeCarrinho: (id) => {

        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        produtos.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // remove o item do carrinho
    removerItemCarrinho: (id) => {

        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => { return e.id != id });
        produtos.metodos.carregarCarrinho();
        produtos.metodos.atualizarBadgeTotal();

    },

    // atualiza a quantidade atual do carrinho
    atualizarCarrinho: (id, qntd) => {

        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        // atualiza o botão carrinho com a quantidade atualizada
        produtos.metodos.atualizarBadgeTotal();

        // atualiza os valores do carrinho
        produtos.metodos.carregarValores();

    },

    // carrega os valores de subtotal, Entrega e total
    carregarValores: () => {

        VALOR_CARRINHO = 0;

        $("#lblSubtotal").text("R$ 0,00");
        // $("lblValorEntrega").text("Uber Flash");
        $("#lblValorTotal").text("R$ 0,00");

        $.each(MEU_CARRINHO, (i, e) => {

            VALOR_CARRINHO += parseFloat(e.price * e.qntd);

            if ((i + 1) == MEU_CARRINHO.length) {
                $("#lblSubtotal").text("R$ " + VALOR_CARRINHO.toFixed(2).replace('.', ','));
                // $("#lblValorEntrega").text("+ R$ " + VALOR_ENTREGA.toFixed(2).replace('.', ','));
                $("#lblValorTotal").text("R$ " + (VALOR_CARRINHO).toFixed(2).replace('.', ','));
            }

        });

    },

    // carrega a etapa de endereço
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            produtos.metodos.mensagem("Seu carrinho está vazio.");
            return;
        }
        produtos.metodos.carregarEtapas(2);

    },

    // API viaCep
    buscarCep: () => {

        // cria a variavel com o valor do cep
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        // verifica se o CEP possui valor informado
        if (cep != "") {

            // Expressão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;

            if (validacep.test(cep)) {

                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {

                        // Atualizar os campos com os valores retornados
                        $("#txtEndereco").val(dados.logradouro);
                        $("#txtBairro").val(dados.bairro);
                        $("#txtCidade").val(dados.localidade);
                        $("#ddlUf").val(dados.uf);
                        $("#txtNumero").focus();

                    }
                    else {
                        produtos.metodos.mensagem('CEP não encontrado. Preencha as informações manualmente.');
                        $("#txtEndereco").focus();
                    }

                })

            }
            else {
                produtos.metodos.mensagem('Formato do CEP inválido.');
                $("#txtCEP").focus();
            }

        }
        else {
            produtos.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
        }

    },

    // validação antes de prosseguir para o resumo do pedido
    resumoPedido: () => {

        let cep = $("#txtCEP").val().trim();
        let endereco = $("#txtEndereco").val().trim();
        let bairro = $("#txtBairro").val().trim();
        let cidade = $("#txtCidade").val().trim();
        let uf = $("#ddlUf").val().trim();
        let numero = $("#txtNumero").val().trim();
        let complemento = $("#txtComplemento").val().trim();

        if (cep.length <= 0) {
            produtos.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCEP").focus();
            return;
        }

        if (endereco.length <= 0) {
            produtos.metodos.mensagem('Informe o Endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }

        if (bairro.length <= 0) {
            produtos.metodos.mensagem('Informe o Bairro, por favor.');
            $("#txtBairro").focus();
            return;
        }

        if (cidade.length <= 0) {
            produtos.metodos.mensagem('Informe a Cidade, por favor.');
            $("#txtCidade").focus();
            return;
        }

        if (uf == "-1") {
            produtos.metodos.mensagem('Informe a UF, por favor.');
            $("#ddlUf").focus();
            return;
        }

        if (numero.length <= 0) {
            produtos.metodos.mensagem('Informe o Número, por favor.');
            $("#txtNumero").focus();
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            uf: uf,
            numero: numero,
            complemento: complemento
        }

        produtos.metodos.carregarEtapas(3);
        produtos.metodos.carregarResumo();
        

    },

    // carrega a etapa de resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html('');

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = produtos.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${name}/g, e.name)
                .replace(/\${price}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd)

            $("#listaItensResumo").append(temp);

        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);

        produtos.metodos.finalizarPedido();

    },

    // Atualiza o link do botão do whatsapp
    finalizarPedido: () => {

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            var texto = 'Olá, gostaria de fazer um pedido com os seguintes itens:';
            texto += '\n*Itens do pedido*\n\n${itens}';
            texto += '\n*Endereço de entrega*';
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
            texto += `\n\n*Valor total do pedido (sem entrega): R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}*`;
            //SE FOR COBRAR FRETE
            // texto += `\n\n*Valor total do pedido (sem entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;
            
            var itens = '';

            $.each(MEU_CARRINHO, (i, e) => {

                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')}\n`;

                // último item do carrinho
                if ((i + 1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a URL
                    let encode = encodeURI(texto);
                    let url = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

                    $("#btnEtapaResumo").attr("href", url);

                    

                }

            
            });
        }

    },

    // carrega o botão de whatsapp
    carregarBotaoWhats: () => {

        var texto = 'Olá Nara, gostaria de conhecer seus produtos.';

        let encode = encodeURI(texto);
        let url = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnWhatsapp").attr("href", url);

    },

    // carrega o botão de ligar
    carregarBotaoLigar: () => {

        $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`);

    },


    // abrir o modal de depoimento
    abrirDeposito: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-" + depoimento).addClass('active');

    },

    carregarBotaoWhatsFooter: () => {

        var texto = 'Olá Nara, gostaria de conhecer seus produtos.';

        let encode = encodeURI(texto);
        let url = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnWhatsappFooter").attr("href", url);

    },

    toggleDescricao: function (id) {
    const desc = document.getElementById(`desc-${id}`);
    const isVisible = desc.style.display === "block";
    desc.style.display = isVisible ? "none" : "block";
    },

    abrirModal: function (titulo, img, descricao) {
    const modal = document.getElementById('modalDescricao');
    const conteudo = document.getElementById('modalDescricaoConteudo');
    conteudo.innerHTML = `<img src="${img}"><h4>${titulo}</h4><p>${descricao}</p>`;
    modal.style.display = "flex";
    },
    

    


    fecharModal: function () {
        document.getElementById('modalDescricao').style.display = "none";
    },









    // mensagem de feedback
   mensagem: (texto, cor = 'red', tempo = 3500) => {

        let id = Math.floor(Date.now() * Math.random()).toString();

        let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeInDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)

    }


}

produtos.templates = {

    item: `
    <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <p class="title-produto text-center mt-4">
                <b>\${name}</b>
            </p>
            <p class="price-produto text-center">
                <b>R$ \${price}</b>
            </p>
            
           
            <div class="add-carrinho">
                <span class="btn-menos" onclick="produtos.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-\${id}">0</span>
                <span class="btn-mais" onclick="produtos.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onclick="produtos.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
               <button class="btn btn-info-icon" onclick="produtos.metodos.abrirModal('\${name}', '\${img}', '\${dsc}')" title="Ver mais"><i class="fas fa-info-circle"></i></button>
            </div>
           

            <div class="desc-produto text-center mt-2" id="desc-\${id}" style="display: none;">
                \${dsc}
            </div>

        </div>
    </div>
    `,

    itemCarrinho: `
    <div class="col-12 item-carrinho">
                        <div class="img-produto">
                            <img src="\${img}" />
                        </div>
                        <div class="dados-produto">
                            <p class="title-produto"><b>\${name}</b></p>
                            <p class="price-produto"><b>R$ \${price}</b></p>
                        </div>
                        <div class="add-carrinho add-carrinho-modal">
                                    <span class="btn-menos-modal" onclick="produtos.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                                    <span class="add-numero-itens-modal" id="qntd-carrinho-\${id}">\${qntd}</span>
                                    <span class="btn-mais-modal" onclick="produtos.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                                    <span class="btn btn-remove no-mobile" onclick="produtos.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
                         </div>

     </div>`,

     itemResumo: `
    <div class="col-12 item-carrinho resumo">
                                <div class="img-produto-resumo">
                                    <img src="\${img}" />
                                </div>
                                <div class="dados-produto">
                                    <p class="title-produto-resumo">
                                        <b>\${name}</b>
                                    </p>
                                    <p class="price-produto-resumo">
                                        <b>R$ \${price}</b>
                                    </p>
                                </div>
                                <p class="quantidade-produto-resumo">
                                    x <b>\${qntd}</span>
                                    <span class="btn-mais-modal" onclick="produtos.metodos.aumentarQuantida</b>
                                </p>

     </div>`

}

    
